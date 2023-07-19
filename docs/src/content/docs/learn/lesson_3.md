---
title: Lesson 3 - Objects and Capabilities
description: A simple tutorial for developing and deploying a simple game on Sui
---


## Objects

Sui Move is object-centric and every object can be **owned** or **shared**.

Owned objects are transferred to an address after they are created,
and can be owned by:
- An address
- Another object

Shared objects can be:
- Immutable: no one can mutate them, for example packages become immutable objects
when deployed.
- Mutable: everyone can mutate them and transactions that interact with them
need to go through consensus.

In lesson 1 we created an object during the initialisation of the smart contract
like:

```rust
    // rest of the code

    fun init(ctx: &mut TxContext) {
        let sword = Sword {
            id: object::new(ctx),
            attack: 5,
        };
        transfer::transfer(sword, tx_context::sender(ctx))
    }

    // rest of the code
```

But we can have a function that we can call anytime to create an object
and send it to an address like:

```rust
    // rest of the code

    public entry fun create_and_send_sword(receiver: address, ctx: &mut TxContext) {
        let sword = Sword {
            id: object::new(ctx),
            attack: 5,
        };
        transfer::transfer(sword, receiver_address)
    }

    // rest of the code
```

## Capabilities

Capabilities are objects that give capabilities to their owners by allowing
them to run smart contract functions that require the capability to run.
In that way, some smart contract functions are gated and do not allow anybody
to create a transaction with them.

Capabilities are objects like the ones that we have seen so far. For example,
in the following code segment we are creating a capability object that is
transferred to the deployer of the smart contract.

```rust
struct OwnerCap has key {
    id: UID
}

fun init(ctx: &mut TxContext) {
    transfer::transfer(OwnerCap {
        id: object::new(ctx)
    }, tx_context::sender(ctx))
}
```

Then, we can have capability-gated public functions like:

```rust
struct AdminCap has key {
    id: UID
}

public entry fun add_additional_admin(_: &OwnerCap, receiver_address: address, ctx: &mut TxContext){
    transfer::transfer(
        AdminCap {
            id: object::new(ctx)
        },
        receiver_address
    )
}
```

this code segment requires the called to already own the `OwnerCap` and pass the
ID of the object as a parameter. The user that owns this capability will be able
to give the `AdminCap` to the `receiver_address`.

And we can allow only admins to be able to create and send swords to remove
spam actions:

```rust
    // rest of the code

    public entry fun create_and_send_sword(_: &AdminCap, receiver: address, ctx: &mut TxContext) {
        let sword = Sword {
            id: object::new(ctx),
            attack: 5,
        };
        transfer::transfer(sword, receiver_address)
    }

    // rest of the code
```