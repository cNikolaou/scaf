---
title: Lesson 1 - Packages, Modules, and Functions
description: A simple tutorial for developing and deploying a simple game on Sui
---


## Packages and Modules

In Sui, a module is a set of types and functions packaged together.
A package is a set of modules.

Packages are published under a specific Sui address.

For example, we can create a `struct` representing a `Sword` item:

```rust
module lesson_1::example_1 {

    struct Sword {
        attack: u64
    }
}
```

The module is defined as `example_1` in the `lesson_1` package.

In the definition of `Sword` we see that a sword has an `attack` strength
which is a value of type `u64`. However, we would like to create objects
from this struct definition, where each sword will have its own `attack`
strength and will be a Sui object in the global storage.

To do that, each `Sword` needs to have:
- the `key` ability
- a globally unique `UID`

```rust
module lesson_1::example_2 {

    use std::object::UID;

    struct Sword has key {
        id: UID
        attack: u64
    }
}
```

Now, in the definition of `Sword` we see that each sword (each `Sword` object
on the Sui blockchain) will have:
- `id` is a global unique ID fo the object that can be used to refer to the object
- `attack` is a value of type `u64`

The last detail of the aforementioned code snippet is the `use std::object::UID`.
This statement imports the `UID` struct from the `object` module that is in
the `std` package. The `std` package, which is deployed at `0x2` address, is
Sui's standard library, and the statement allows us to use the `UID` struct
definition from the standard library in our smart contract.

## Functions

Apart from type definitions and `use` statements, modules have functions.
Functions are declared with the `fun` keyword as shown below:

```rust
module lesson_1::example_3 {

    use std::object::UID;

    struct Sword has key {
        id: UID
        attack: u64
    }

    public fun get_attack(sword: &Sword): u64 {
        sword.attack
    }
}
```

Functions with the `entry` keyword are callable by transactions.

Each smart contract can also have one `init` function that runs when the
smart contract is published on the Sui blockchain. If we add an `init`
function to the sword-contract we are building we will get:

```rust
module lesson_1::example_4 {

    use std::object::{Self, UID};
    use std::transfer;
    use std::tx_context::{Self, TxContext}

    struct Sword has key {
        id: UID
        attack: u64
    }

    fun init(ctx: &mut TxContext) {
        let sword = Sword {
            id: object::new(ctx),
            attack: 5,
        };
        transfer::transfer(sword, tx_context::sender(ctx))
    }

    public fun get_attack(sword: &Sword): u64 {
        sword.attack
    }
}
```