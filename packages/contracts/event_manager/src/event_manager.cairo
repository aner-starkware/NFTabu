// TODO: Make upgradable.
// TODO: Add events.

use starknet::ContractAddress;
use crate::utils::time::Time;


/// Basic information about an event.
// TODO: Consider adding a name and description.
#[derive(Drop, Serde, starknet::Store)]
struct EventInfo {
    /// The time of the event, as a Unix timestamp.
    time: Time,
    /// The number of users registered to the event.
    number_of_participants: usize,
}

#[derive(Drop, Serde)]
struct ExtededEventInfo {
    /// The time of the event, as a Unix timestamp.
    time: Time,
    /// The users registered to the event.
    participants: Array<ContractAddress>,
    /// Whether the event has been canceled.
    canceled: bool,
}

/// Information about a user's registration to an event.
#[derive(Drop, Serde)]
struct EventUserInfo {
    /// The ID of the event.
    id: usize,
    /// The time of the event, as a Unix timestamp.
    time: Time,
    /// Whether the user is registered to the event.
    registered: bool,
    /// Whether the event has been canceled.
    canceled: bool,
}

#[derive(Drop, Serde, starknet::Store)]
enum RegistrationStatus {
    /// The user is not registered to the event.
    #[default]
    NotRegistered,
    /// The user is registered to the event.
    Registered,
    /// The user has registered to the event, and then unregistered. Used to prevent double
    /// entries in the event user list.
    Unregistered,
}

#[generate_trait]
impl RegistrationStatusImpl of RegistrationStatusTrait {
    /// Returns whether the user is registered to the event.
    fn is_registered(self: @RegistrationStatus) -> bool {
        match self {
            RegistrationStatus::Registered => true,
            _ => false,
        }
    }
    /// Returns whether the user has interacted with the event (i.e. either registered or registered
    /// and then unregistered).
    fn has_interacted(self: @RegistrationStatus) -> bool {
        match self {
            RegistrationStatus::Registered | RegistrationStatus::Unregistered => true,
            _ => false,
        }
    }
}

#[starknet::interface]
trait IRegistration<T> {
    /// Returns information about the events the user is registered to, within a time range. The
    /// range is [start, end).
    fn get_user_events_by_time(
        self: @T, user: ContractAddress, start: Time, end: Time
    ) -> Array<EventUserInfo>;
    /// Gets the number of events in the contract.
    // TODO: Consider removing this function.
    fn n_events(self: @T) -> usize;
    /// Returns the extended information of all the events within a time range. The range is
    /// [start, end).
    fn get_participation_report_by_time(
        self: @T, start: Time, end: Time
    ) -> Array<ExtededEventInfo>;

    /// Gets the information of an event. Time will be 0 if the event does not exist.
    fn event_info(self: @T, event_id: usize) -> EventInfo;
    /// Gets the information of a range of events by their times. The range is [start, end).
    fn get_events_infos_by_time(self: @T, start: Time, end: Time) -> Array<EventInfo>;

    /// Registers a user to an event. The user id is the caller address of the transaction.
    fn register(ref self: T, event_id: usize);
    /// Unregisters a user from an event. The user id is the caller address of the transaction.
    fn unregister(ref self: T, event_id: usize);

    /// Adds an event to the contract.
    fn add_event(ref self: T, time: felt252);
    /// Modifies the time of an event.
    fn modify_event_time(ref self: T, event_id: usize, time: felt252);
    /// Sets whether an event is canceled.
    fn set_event_canceled(ref self: T, event_id: usize, canceled: bool);

    /// Adds a user to the set of allowed users.
    fn add_allowed_user(ref self: T, user: ContractAddress);
    /// Removes a user from the set of allowed users.
    fn remove_allowed_user(ref self: T, user: ContractAddress);
    /// Adds a list of users to the set of allowed users.
    fn add_allowed_users(ref self: T, users: Span<ContractAddress>);
    /// Returns if a user is allowed to register to events.
    fn is_allowed_user(self: @T, user: ContractAddress) -> bool;

    /// Checks whether the user is an admin.
    fn is_admin(self: @T, user: ContractAddress) -> bool;
    /// Adds a user to the set of admins.
    fn add_admin(ref self: T, user: ContractAddress);
}

#[starknet::contract]
mod registration {
    use super::RegistrationStatusTrait;
    use super::IRegistration;
    use starknet::storage::VecTrait;
    use starknet::storage::MutableVecTrait;
    use crate::utils::time::{Time, TimeTrait};
    use starknet::storage::StorageAsPointer;
    use starknet::storage::StoragePathEntry;
    use starknet::storage::StorageMapReadAccess;
    use starknet::storage::StoragePointerWriteAccess;
    use starknet::storage::StoragePointerReadAccess;
    use starknet::storage::StorageMapWriteAccess;
    use super::{EventInfo, EventUserInfo, RegistrationStatus, ExtededEventInfo};
    use starknet::ContractAddress;
    use starknet::storage::{Map, Vec};

    #[storage]
    struct Storage {
        /// A map from event ID to event information.
        events: Map<usize, EventInfo>,
        /// A map from event ID to the users registered to the event. Users who unregistered are
        /// also included, and should be filtered out when needed.
        registered_users: Map<usize, Vec<ContractAddress>>,
        /// A map from event ID to whether the event has been canceled.
        event_canceled: Map<usize, bool>,
        /// A simple data structure to allow lookup of events by time. The key is the day of the
        /// event, and the value is a vector of event IDs.
        events_by_day: Map<u64, Vec<usize>>,
        /// The number of events in the contract.
        n_events: usize,
        /// The set of users who may register to events.
        allowed_users: Map<ContractAddress, bool>,
        /// A map from event_id to a map from user to whether the user is registered to the event.
        registration_status: Map<(usize, ContractAddress), RegistrationStatus>,
        /// A set of admins.
        // TODO: Use Roles component.
        admins: Map<ContractAddress, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        UserRegistration: UserRegistration,
        EventChanged: EventChanged,
        EventCancellation: EventCancellation,
        UserAllowed: UserAllowed,
    }

    #[derive(Drop, starknet::Event)]
    struct UserRegistration {
        #[key]
        user: ContractAddress,
        #[key]
        event_id: usize,
        status: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct EventChanged {
        event_id: usize,
        time: Time,
    }

    #[derive(Drop, starknet::Event)]
    struct EventCancellation {
        event_id: usize,
        canceled: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct UserAllowed {
        user: ContractAddress,
        allowed: bool,
    }

    #[constructor]
    fn constructor(ref self: ContractState, admin: ContractAddress) {
        self.admins.write(admin, true);
    }

    #[generate_trait]
    impl PrivateFunctionsImpl of PrivateFunctions {
        fn _add_event(ref self: ContractState, time: felt252) {
            let n_events_ptr = self.n_events.as_ptr();
            let n_events = n_events_ptr.read();
            let time = TimeTrait::new(time.try_into().expect('Invalid time'));
            let event_id = n_events + 1;
            let event_day = time.day();
            self.events.write(n_events.into(), EventInfo { time, number_of_participants: 0 });
            n_events_ptr.write(event_id);
            self.events_by_day.entry(event_day).append().write(event_id.into());

            self.emit(EventChanged { event_id: n_events.into(), time });
        }

        fn _modify_event_time(ref self: ContractState, event_id: usize, time: felt252) {
            self._check_event_exists(event_id);
            // TODO: Check not cancelled.

            let time = TimeTrait::new(time.try_into().expect('Invalid time'));
            self.events.entry(event_id).time.write(time);

            self.emit(EventChanged { event_id, time });
        }

        fn _check_event_exists(self: @ContractState, event_id: usize) {
            assert(event_id < self.n_events.read(), 'Event does not exist.');
        }

        fn _check_not_canceled(self: @ContractState, event_id: usize) {
            self._check_event_exists(event_id);
            assert(!self.event_canceled.read(event_id), 'Event canceled.');
        }

        fn _register_user_to_event(
            ref self: ContractState, event_id: usize, user: ContractAddress
        ) {
            self._check_not_canceled(event_id);
            // TODO: Explain why we need to use a pointer here.
            let registration_status_ptr = self.registration_status.entry((event_id, user));
            let prev_status = registration_status_ptr.read();
            assert(!prev_status.is_registered(), 'User already registered.');
            self.registration_status.write((event_id, user), RegistrationStatus::Registered);
            let n_participants_ptr = self.events.entry(event_id).number_of_participants;
            let n_participants = n_participants_ptr.read();
            n_participants_ptr.write(n_participants + 1);
            // Add the user to the list of registered users, unless they have already interacted
            // with the event and are already in the list.
            if !prev_status.has_interacted() {
                self.registered_users.entry(event_id).append().write(user);
            }
            self.emit(UserRegistration { user, event_id, status: true });
        }

        fn _unregister_user_from_event(
            ref self: ContractState, event_id: usize, user: ContractAddress
        ) {
            self._check_event_exists(event_id);
            // let canceled = self.event_canceled.read(event_id);
            // let event_time: u256 = self.events.read(event_id).time.into();
            // assert(event_time < starknet::get_block_timestamp().into(), 'Event already
            // started.');
            let registration_status_ptr = self.registration_status.entry((event_id, user));
            assert(registration_status_ptr.read().is_registered(), 'User not registered.');
            registration_status_ptr.write(RegistrationStatus::Unregistered);

            let n_participants_ptr = self.events.entry(event_id).number_of_participants;
            let n_participants = n_participants_ptr.read();
            n_participants_ptr.write(n_participants - 1);

            self.emit(UserRegistration { user, event_id, status: false });
        }

        fn _get_event_extended_info(self: @ContractState, event_id: usize) -> ExtededEventInfo {
            let event = self.events.read(event_id);
            let mut participants = ArrayTrait::new();
            let event_participants_vec = self.registered_users.entry(event_id);
            let n_registered = event_participants_vec.len();
            #[cairofmt::skip]
            for i in 0..n_registered {
                let user_address = event_participants_vec.at(i).read();
                let user_status = self.registration_status.read((event_id, user_address));
                if user_status.is_registered() {
                    participants.append(user_address);
                }
            };
            let canceled = self.event_canceled.read(event_id);
            ExtededEventInfo { time: event.time, participants, canceled }
        }
    }

    #[abi(embed_v0)]
    impl RegistrationImpl of super::IRegistration<ContractState> {
        fn get_user_events_by_time(
            self: @ContractState, user: ContractAddress, start: Time, end: Time
        ) -> Array<EventUserInfo> {
            let mut events = ArrayTrait::new();
            let start_day = start.day();
            let end_day = end.day();
            // Formatting of for loops with ranges is bad in this version of Cairo.
            #[cairofmt::skip]
            for day in start_day..end_day {
                let cur_day_events = self.events_by_day.entry(day);
                let n_events_in_day = cur_day_events.len();
                for i in 0..n_events_in_day {
                    let event_id = cur_day_events.at(i).read();
                    let registered = self.registration_status.read((event_id, user)).is_registered();
                    if !registered {
                        continue;
                    }
                    let event = self.events.read(event_id);
                    let canceled = self.event_canceled.read(event_id);
                    if event.time >= start && event.time < end {
                        events
                            .append(
                                EventUserInfo {
                                    id: event_id,
                                    time: event.time,
                                    registered,
                                    canceled,
                                }
                            );
                    }
                }
            };
            events
        }

        fn n_events(self: @ContractState) -> usize {
            self.n_events.read()
        }

        fn get_participation_report_by_time(
            self: @ContractState, start: Time, end: Time
        ) -> Array<ExtededEventInfo> {
            let mut events = ArrayTrait::new();
            let start_day = start.day();
            let end_day = end.day();
            // Formatting of for loops with ranges is bad in this version of Cairo.
            #[cairofmt::skip]
            for day in start_day..end_day {
                let cur_day_events = self.events_by_day.entry(day);
                let n_events_in_day = cur_day_events.len();
                for i in 0..n_events_in_day {
                    let event_id = cur_day_events.at(i).read();
                    let event = self.events.read(event_id);
                    if event.time >= start && event.time < end {
                        events.append(self._get_event_extended_info(event_id));
                    }
                }
            };
            events
        }

        fn event_info(self: @ContractState, event_id: usize) -> EventInfo {
            self.events.read(event_id)
        }

        fn get_events_infos_by_time(
            self: @ContractState, start: Time, end: Time
        ) -> Array<EventInfo> {
            let mut events = ArrayTrait::new();
            let start_day = start.day();
            let end_day = end.day();
            // Formatting of for loops with ranges is bad in this version of Cairo.
            #[cairofmt::skip]
            for day in start_day..end_day {
                    let cur_day_events = self.events_by_day.entry(day);
                    let n_events_in_day = cur_day_events.len();
                    for i in 0..n_events_in_day {
                        let event_id = cur_day_events.at(i).read();
                        let event = self.events.read(event_id);
                        if event.time >= start && event.time < end {
                            events.append(event);
                        }
                    }
                };
            events
        }

        fn add_event(ref self: ContractState, time: felt252) {
            // TODO: Check owner.
            self._add_event(time);
        }

        fn modify_event_time(ref self: ContractState, event_id: usize, time: felt252) {
            // TODO: Check owner.
            self._modify_event_time(event_id, time);
        }

        fn set_event_canceled(ref self: ContractState, event_id: usize, canceled: bool) {
            // TODO: Check owner.
            self._check_event_exists(event_id);
            self.event_canceled.write(event_id, canceled);

            self.emit(EventCancellation { event_id, canceled });
        }

        fn add_allowed_user(ref self: ContractState, user: ContractAddress) {
            // TODO: Check owner.
            assert(!self.allowed_users.read(user), 'User already registered.');
            self.allowed_users.write(user, true);

            self.emit(UserAllowed { user, allowed: true });
        }

        fn remove_allowed_user(ref self: ContractState, user: ContractAddress) {
            // TODO: Check owner.
            assert(self.allowed_users.read(user), 'User not registered.');
            self.allowed_users.write(user, false);

            self.emit(UserAllowed { user, allowed: false });
        }

        fn add_allowed_users(ref self: ContractState, users: Span<ContractAddress>) {
            // TODO: Check owner.
            for user in users {
                self.add_allowed_user(*user);
            }
        }

        fn is_allowed_user(self: @ContractState, user: ContractAddress) -> bool {
            self.allowed_users.read(user)
        }

        fn register(ref self: ContractState, event_id: usize) {
            let user = starknet::get_caller_address();

            // Check that the user is allowed to register to events.
            assert(self.is_allowed_user(user), 'User not allowed to register.');
            self._register_user_to_event(:event_id, :user);
        }

        fn unregister(ref self: ContractState, event_id: usize) {
            let user = starknet::get_caller_address();
            self._unregister_user_from_event(:event_id, :user);
        }


        fn is_admin(self: @ContractState, user: ContractAddress) -> bool {
            self.admins.read(user)
        }

        fn add_admin(ref self: ContractState, user: ContractAddress) {
            let caller_address = starknet::get_caller_address();
            assert(self.is_admin(caller_address), 'Caller is not an admin.');
            self.admins.write(user, true);
        }
    }
}
