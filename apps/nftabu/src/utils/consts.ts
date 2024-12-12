/// A prefix to be added to the src path of resources (images, etc.) in order to correctly load them.
/// Production mode is when deploying the app to a server, github pages in our case.
export const SrcPrefix =
  import.meta.env.MODE === 'production' ? '/nftabu-app' : '';

/// The address of the deployed contract.
export const CONTRACT_ADDRESS =
  '0x0530c99415b21ae246412f10c6e24ba8b26e6b567ce97e9366bd052e009337bb';
/// The ABI of the deployed contract. Can be found on starkscan.
/// For the above contract, the ABI can be found at:
/// https://sepolia.starkscan.co/contract/0x049c75609bb077a9427bc26a9935472ec75e5508ed216ef7f7ad2693397deebc
/// And the ABI is accessible under the 'Class Code/History' tab -> 'Copy ABI Code' button.
export const ABI = [
  {
    "name": "AdsImpl",
    "type": "impl",
    "interface_name": "event_manager::ads_interface::IAds"
  },
  {
    "name": "event_manager::utils::apartment::ApartmentInfo",
    "type": "struct",
    "members": [
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "address",
        "type": "(core::felt252, core::felt252, core::felt252)"
      },
      {
        "name": "area",
        "type": "core::felt252"
      },
      {
        "name": "floor",
        "type": "core::felt252"
      }
    ]
  },
  {
    "name": "core::bool",
    "type": "enum",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "name": "core::byte_array::ByteArray",
    "type": "struct",
    "members": [
      {
        "name": "data",
        "type": "core::array::Array::<core::bytes_31::bytes31>"
      },
      {
        "name": "pending_word",
        "type": "core::felt252"
      },
      {
        "name": "pending_word_len",
        "type": "core::integer::u32"
      }
    ]
  },
  {
    "name": "event_manager::utils::ad::AdInfo",
    "type": "struct",
    "members": [
      {
        "name": "apartment_id",
        "type": "core::integer::u128"
      },
      {
        "name": "apartment",
        "type": "event_manager::utils::apartment::ApartmentInfo"
      },
      {
        "name": "is_sale",
        "type": "core::bool"
      },
      {
        "name": "price",
        "type": "core::felt252"
      },
      {
        "name": "publication_date",
        "type": "core::felt252"
      },
      {
        "name": "entry_date",
        "type": "core::felt252"
      },
      {
        "name": "description",
        "type": "core::byte_array::ByteArray"
      },
      {
        "name": "picture_url",
        "type": "core::byte_array::ByteArray"
      }
    ]
  },
  {
    "name": "core::option::Option::<event_manager::utils::ad::AdInfo>",
    "type": "enum",
    "variants": [
      {
        "name": "Some",
        "type": "event_manager::utils::ad::AdInfo"
      },
      {
        "name": "None",
        "type": "()"
      }
    ]
  },
  {
    "name": "core::array::Span::<(core::integer::u128, event_manager::utils::ad::AdInfo)>",
    "type": "struct",
    "members": [
      {
        "name": "snapshot",
        "type": "@core::array::Array::<(core::integer::u128, event_manager::utils::ad::AdInfo)>"
      }
    ]
  },
  {
    "name": "event_manager::ads_interface::IAds",
    "type": "interface",
    "items": [
      {
        "name": "get_ad_info",
        "type": "function",
        "inputs": [
          {
            "name": "ad_id",
            "type": "core::integer::u128"
          }
        ],
        "outputs": [
          {
            "type": "core::option::Option::<event_manager::utils::ad::AdInfo>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "publish_ad",
        "type": "function",
        "inputs": [
          {
            "name": "ad_info",
            "type": "event_manager::utils::ad::AdInfo"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "remove_ad",
        "type": "function",
        "inputs": [
          {
            "name": "ad_id",
            "type": "core::integer::u128"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "name": "get_next_id",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u128"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "dummy_ads",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "offer_sale",
        "type": "function",
        "inputs": [
          {
            "name": "apartment_id",
            "type": "core::integer::u128"
          },
          {
            "name": "buyer",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "price",
            "type": "core::integer::u128"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "buy",
        "type": "function",
        "inputs": [
          {
            "name": "apartment_id",
            "type": "core::integer::u128"
          },
          {
            "name": "price",
            "type": "core::integer::u128"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_all_ads",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::array::Span::<(core::integer::u128, event_manager::utils::ad::AdInfo)>"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "name": "OwnableImpl",
    "type": "impl",
    "interface_name": "openzeppelin_access::ownable::interface::IOwnable"
  },
  {
    "name": "openzeppelin_access::ownable::interface::IOwnable",
    "type": "interface",
    "items": [
      {
        "name": "owner",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "transfer_ownership",
        "type": "function",
        "inputs": [
          {
            "name": "new_owner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "renounce_ownership",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "name": "constructor",
    "type": "constructor",
    "inputs": [
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "registration_contract_addr",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "previous_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "new_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "previous_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "new_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
    "type": "event",
    "variants": [
      {
        "kind": "nested",
        "name": "OwnershipTransferred",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred"
      },
      {
        "kind": "nested",
        "name": "OwnershipTransferStarted",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "event_manager::ads::ads::Event",
    "type": "event",
    "variants": [
      {
        "kind": "flat",
        "name": "OwnableEvent",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::Event"
      }
    ]
  }
] as const satisfies Abi;
  