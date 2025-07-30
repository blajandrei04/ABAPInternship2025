sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {
        },
        async onForgotPasswordPress(){
            this.oDialog ??= await this.loadFragment({
                name: "project1.view.ForgotPass",
        }),
            this.oDialog.open();
        },
        onCloseDialog() {
            this.oDialog.close();
        }
    });
});