module hello_world::hello_world {

    use std::string;

    /// An object that contains an arbitrary string
    public struct HelloWorldObject has key, store {
        /// Global unique ID
        id: UID,
        /// A string contained in the object
        text: string::String
    }

    public entry fun mint(ctx: &mut TxContext) {
        let object = HelloWorldObject {
            id: object::new(ctx),
            text: string::utf8(b"Hello World!")
        };
        transfer::transfer(object, tx_context::sender(ctx));
    }

    #[test]
    fun do_nothing_test() {
        let ctx = &mut tx_context::dummy();
        let hwo = HelloWorldObject {
            id: object::new(ctx),
            text: string::utf8(b"Test String")
        };

        // Destructure the object to delete
        let HelloWorldObject { id, text: _ } = hwo;
        id.delete();
    }
}
