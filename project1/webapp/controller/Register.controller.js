
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, History, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.Register", {
        onInit() {
            console.log("Register Controller initialized");

            const oData = {
                recipient: {
                    name: "Robert"
                }
            };
            const oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "local"); // Giving a name to the local JSON model
            
            // The i18n model is already configured in the manifest.json
        },
        onSubmit() {
            const oView = this.getView();
            const sEmail = oView.byId("EmailId").getValue().trim();
            const sPassword = oView.byId("PasswordId").getValue().trim();
            const sConfirmationPassword = oView.byId("ConfirmationPasswordId").getValue().trim();

            const oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            const eMsg = oBundle.getText("errorMsg");

            if (!sEmail || !sPassword || !sConfirmationPassword) {
                MessageBox.error(eMsg, {
                    title: "Error",
                });
                return;
            }

            if (sPassword !== sConfirmationPassword) {
                MessageBox.error("Passwords do not match.", {
                    title: "Error",
                });
                return;
            }

            if (!sEmail.includes("@") || !sEmail.includes(".")) {
                MessageBox.error("Please enter a valid email address.", {
                    title: "Invalid Email",
                });
                return;
            }

            // Get the OData model, which is the default unnamed model
            const oODataModel = this.getView().getModel();

            oODataModel.callFunction("/Register", {
                method: "POST",
                urlParameters: {
                    EMAIL: sEmail,
                    PASSWORD: sPassword,
                    PASSWORD1: sConfirmationPassword
                },
                success: (oData) => {
                    if (oData) {
                        MessageToast.show("Registration successful! You can now log in.");
                        this.getRouter().navTo("RouteView1");
                    } else {
                        MessageBox.error("Registration failed. Please try again.");
                    }
                },
                error: (oError) => {
                    console.error("Registration failed:", oError);
                    MessageBox.error("Registration failed. Please try again.");
                }
            });
        },
        getRouter() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("RouteView1", {}, true /*no history*/);
            }
        },
    });
});
