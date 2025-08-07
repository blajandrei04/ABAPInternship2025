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

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.loadData("./model/test_data.json", null, true);  // parametrul 3 = async true

            oModel.attachRequestCompleted(function () {
                console.log("Datele au fost încărcate:", oModel.getData());
            });

            oModel.attachRequestFailed(function () {
                console.error("Eroare la încărcarea datelor.");
            });

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
        onGiveFeedback() {
            this.getRouter().navTo("Route360FbPage");
        },
        onOpenManager(){
            this.getRouter().navTo("RouteManagerPage");
        },
        async onRequestPeg() {
            this._oPegDialog ??= await this.loadFragment({
                name: "project1.view.PegDialog",
            }),
                this._oPegDialog.open();
        },
        async onChangePasswordPress() {
            this._oChangePassDialog ??= await this.loadFragment({
                name: "project1.view.ChangePass",
            }),
                this._oChangePassDialog.open();
        },

        onClosePegDialog() {
            this._oPegDialog.close();
        },

        onConfirmChangePassword() {
            const oView = this.getView();
            const sOldPassword = oView.byId("changeEmailInput1").getValue();
            const sNewPassword = oView.byId("changeEmailInput12").getValue();
            if (sOldPassword !== sNewPassword) {
                MessageBox.error("Passwords do not match.", {
                    title: "Error",
                });
                return;
            }
            MessageToast.show("Password changed successfully!");
            this.onCloseDialog();
        },

        onCloseDialog() {
            this._oChangePassDialog.close();
        },
        
        onLogoutPress() {
            MessageBox.confirm("Are you sure you want to log out", {
                onClose: (oAction) => {
                    if (oAction === MessageBox.Action.OK) {
                        this.getRouter().navTo("RouteView1");
                    }
                }
            });
        },
        onStatusFilterChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();

            var oTable = this.byId("pegTable"); // sau id-ul tabelului tău
            var oBinding = oTable.getBinding("items");

            if (sSelectedKey) {
                // Creează un filtru pentru câmpul Status
                var oFilter = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, sSelectedKey);
                oBinding.filter([oFilter]);
            } else {
                // Dacă nu e nimic selectat, elimină filtrul
                oBinding.filter([]);
            }
        },
        onRatePegPress: function () {
            this.getRouter().navTo("RouteRatePegPage");
        }



    });
});