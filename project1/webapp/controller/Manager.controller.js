sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], (BaseController, MessageToast, MessageBox, History, JSONModel) => {
    "use strict";

    return BaseController.extend("project1.controller.Manager", {
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
        onLogoutPress() {
            MessageBox.confirm("Are you sure you want to log out?", {
                onClose: (oAction) => {
                    if (oAction === MessageBox.Action.OK) {
                        this.getRouter().navTo("RouteView1");
                    }
                }
            });
        }, onManagerStatusFilterChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();

            var oTable = this.byId("ManagerPegsTable");
            var oBinding = oTable.getBinding("items");

            if (sSelectedKey) {
                // Creează un filtru pentru câmpul Status
                var oFilter = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, sSelectedKey);
                oBinding.filter([oFilter]);
            } else {
                // Dacă nu e nimic selectat, elimină filtrul
                oBinding.filter([]);
            }
        }
    });
});
