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
            this.getView().setModel(oModel);
        },
        onSubmit() {

            const oView = this.getView();

            const sFirstName = oView.byId("FirstNameId").getValue();
            const sLastName = oView.byId("LastNameId").getValue();
            const sEmail = oView.byId("EmailId").getValue();
            const sPassword = oView.byId("PasswordId").getValue();
            const sConfirmationPassword = oView.byId("ConfirmationPasswordId").getValue();

            const oBundle = this.getView().getModel("i18n").getResourceBundle();
            const eMsg = oBundle.getText("errorMsg");

            if (sFirstName === "" || sLastName === "" || sEmail === "" || sPassword === "" || sConfirmationPassword === "") {
                MessageBox.error(eMsg, {
                    title: "Error",
                });
            } else {
                const sMsg = oBundle.getText("showMsg", [sFirstName, sLastName, sEmail, sPhone, sCareer]);

                MessageToast.show(sMsg);
            }
        },
        getRouter() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        onNavBack: function () {
            var oHistory, sPreviousHash;

            oHistory = History.getInstance();
            sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("RouteView1", {}, true /*no history*/);
            }
        }
    });
});