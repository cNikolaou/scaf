// Simple fungible token implementation based on the Fungible Token implementation found in:
//      https://github.com/sui-foundation/sui-move-intro-course
//

module fungible_token::tokename {

    // tokenaem
    use sui::coin::{Self, Coin, TreasuryCap};

    // Type for the Name of the coin. By convention, this type has the same
    // name as the parent module, but with capital letters.
    // The full type of the coin defined by this module will be `COIN<TOKENAME>`.
    public struct TOKENAME has drop {}

    // On module initialisation register the tokename currency by calling
    // coin::create_currency<TOKENAME>. The witness is dropped at the end of
    // the init function, which makes sure that the coin is registered only
    // once.The function call returns the:
    //
    //  - `TreasuryCap<TOKENAME>` which is transfered to the caller
    //      and creator of the token and allows the creator to be the
    //      manager of the coin and the supply. `TreasuryCap<TOKENAME>` has
    //      a `total_supply: Supply<TOKENAME>` field.
    //
    // - `CoinMetadata<TOKENAME>` which becomes a shared immutable object
    //      after calling `transfer::public_freeze_object` and keeps metadata
    //      information about the token, such as the symbol, the name, etc.
    //
    fun init(witness: TOKENAME, ctx: &mut TxContext) {

        let (treasury_cap, metadata) = coin::create_currency<TOKENAME>(
            witness,
            2,
            b"TOKENAME",
            b"TKN",
            b"",
            option::none(),
            ctx
        );

        transfer::public_freeze_object(metadata);

        // transfer the `TreasuryCap<TOKENAME>` capability to the package publisher
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx))
    }

    // Manager can mint new coins by calling the `coin` module minting function
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<TOKENAME>, amount: u64,
        recipient: address, ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx)
    }

    // Manager can burn coins by calling the `coin` module burn function
    public entry fun burn(
        treasury_cap: &mut TreasuryCap<TOKENAME>, coin: Coin<TOKENAME>
    ) {
        coin::burn(treasury_cap, coin);
    }

    #[test_only]
    // Simple test for the module initialisation
    public fun test_init(ctx: &mut TxContext) {
        init(TOKENAME {}, ctx)
    }
}
