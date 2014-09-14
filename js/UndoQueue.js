(function(){
    
    function UndoQueue(){
		// mixin event emitting superpowers
		eventEmitter.call(this);

        this.undoQueue = [];
        this.redoQueue = [];
    }

    UndoQueue.prototype = {
        constructor: UndoQueue,

        push: function(action){
            // TODO - dont let queue get too big
            this.undoQueue.push(action);
            // if a new action has been pushed
            // the redoQueue starts from scratch
            this.redoQueue = [];
            this.emit("update");
        },
        
        // call the undo at the top of the stack
        // and move it to the redo queue
        undo: function(){
            var action = this.undoQueue.pop();
            action.undo();
            this.redoQueue.push(action);
            this.emit("update");
        }, 

        // call the redo at the top of the stack
        // and move it to the undo queue
        redo: function(){
            var action = this.redoQueue.pop();
            action.redo();
            this.undoQueue.push(action);
            this.emit("update");
        },

        // clears all undos and redos
        clear: function(){
            this.undoQueue = [];
            this.redoQueue = [];
            this.emit("update");
        }

    };

    window.UndoQueue = UndoQueue;
})();
