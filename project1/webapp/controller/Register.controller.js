sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, JSONModel) => {
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
            const sPhone = oView.byId("PhoneNumberId").getValue();
            const sSU = oView.byId("SUId").getValue();
            const sCareer = oView.byId("CareerLevelId").getValue();

            const oBundle = this.getView().getModel("i18n").getResourceBundle();
            const eMsg = oBundle.getText("errorMsg");

            if (sFirstName === "" || sLastName === "" || sEmail === "" || sPhone === "" || sSU === "" || sCareer === "") {
                MessageBox.error(eMsg, {
                    title: "Error",
                });
            } else {
                const sMsg = oBundle.getText("showMsg", [sFirstName, sLastName, sEmail, sPhone, sCareer]);

                MessageToast.show(sMsg);
            }
        }
    });
});