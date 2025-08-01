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
        },
        onRegisterPress() {
            this.getRouter().navTo("RouteRegister");
        },
        onLoginPress(){
            this.getRouter().navTo("RouteHomePage");
        },
        onConfirmForgotPassword() {
            this.onCloseDialog();
        },
        getRouter() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        }
    });
});