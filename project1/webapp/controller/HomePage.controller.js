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
            console.log("Home page initialized");
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
        onLogoutPress() {
            MessageBox.confirm("Are you sure you want to log out?", {
                title: "Confirm Logout",
                onClose: (oAction) => {
                    if (oAction === MessageBox.Action.OK) {
                        this.getRouter().navTo("RouteView1");
                        MessageToast.show("Logged out successfully");
                    }
                }
            });
        },
        onChangePasswordPress() {
            this.oDialog ??= sap.ui.xmlfragment("project1.view.ChangePass", this);
            this.getView().addDependent(this.oDialog);
            this.oDialog.open();
        },
        onCloseDialog() {
            if (this.oDialog) {
                this.oDialog.close();
            }
        },
        onConfirmChangePassword() {
            this.onCloseDialog();
        },
        onSendFeedbackPress() {
            this.getRouter().navTo("Route360FB");
        }
    });
});