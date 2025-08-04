sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, History, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.HomePage", {
        onInit() {

            const oMockData = {
                Resume: [
                    {
                        Name: "Ina",
                        Surname: "Dan",
                        CareerLevel: "INTERN"
                    },
                    {
                        Name: "Stefania",
                        Surname: "Maracine",
                        CareerLevel: "INTERN"
                    },
                    {
                        Name: "Darius",
                        Surname: "Borza",
                        CareerLevel: "INTERN"
                    },
                    {
                        Name: "Dorian",
                        Surname: "Hornea",
                        CareerLevel: "SENIOR CONSULTANT"
                    },
                    {
                        Name: "Diana",
                        Surname: "Zaha",
                        CareerLevel: "INTERN"
                    }
                ]
            };

            const oModel = new JSONModel(oMockData);
            this.getView().setModel(oModel);
            
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
        },
        onGiveFeedback(){
            this.getRouter().navTo("Route360FbPage");
        },
        onRequestPeg(){
            this.getRouter().navTo("RoutePegPage");
        },
         async onChangePasswordPress(){
            this.oDialog ??= await this.loadFragment({
                name: "project1.view.ChangePass",
        }),
            this.oDialog.open();
        },
        onCloseDialog() {
            this.oDialog.close();
        },
        onConfirmChangePassword() {
            MessageToast.show("Password changed successfully!");
            this.onCloseDialog();
        },
        onLogoutPress() {
            MessageBox.confirm("Are you sure you want to log out", {
                onClose: (oAction) => {
                    if (oAction === MessageBox.Action.OK) {
                        this.getRouter().navTo("RouteView1");
                    }
                }
            });
        }
    });
});