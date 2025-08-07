sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, History, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {
            var oModel = new JSONModel();
            oModel.loadData("./model/test_data.json", null, true); // async = true

            oModel.attachRequestCompleted(() => {
                console.log("Data loaded:", oModel.getData());
            });

            oModel.attachRequestFailed(() => {
                console.error("Error loading test_data.json.");
            });

            this.getView().setModel(oModel, "resume");
        },

        async onForgotPasswordPress() {
            this.oDialog ??= await this.loadFragment({
                name: "project1.view.ForgotPass" // You must replace with your actual fragment path
            });
            this.oDialog.open();
        },
        onCloseDialog() {
            this.oDialog.close();
        },

        onRegisterPress() {
            this.getRouter().navTo("RouteRegister");
        },

        onConfirmForgotPassword() {
            this.onCloseDialog();
        },

        getRouter() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        onLoginPress() {
            const oView = this.getView();
            const sEmail = oView.byId("usernameInput").getValue().toLowerCase();
            const sPassword = oView.byId("passwordInput").getValue();

            if (!sEmail || !sPassword) {
                MessageBox.error("Please fill in both fields.");
                return;
            }

            const aUsers = oView.getModel("resume")?.getProperty("/Resume") || [];

            const oUser = aUsers.find(u =>
                u.Email?.toLowerCase() === sEmail &&
                u.Password === sPassword
            );

            if (oUser) {
            MessageToast.show("Login successful: " + oUser.Name + " " + oUser.Surname);
            this.getRouter().navTo("RouteHomePage");
            } else {
            MessageBox.error("Invalid email or password.");
            }
        }
    });
});
