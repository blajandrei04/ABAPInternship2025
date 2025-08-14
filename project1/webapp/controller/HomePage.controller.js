sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, MessageToast, MessageBox, History, JSONModel, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("project1.controller.HomePage", {
        onInit() {
            console.log("HomePage Controller initialized");
            this.getRouter()
                .getRoute("RouteHomePage")
                .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched() {
            const oUserModel = this.getOwnerComponent().getModel("user");

            if (!oUserModel || !oUserModel.getProperty("/isLoggedIn")) {
                console.warn("User not logged in yet. Redirecting to login.");
                this.getRouter().navTo("RouteView1");
                return;
            }

            const sLoggedInUserEmail = oUserModel.getProperty("/USER_EMAIL");
            console.log("Logged-in user email:", sLoggedInUserEmail);

            const oODataModel = this.getOwnerComponent().getModel();

            oODataModel.callFunction("/ViewTeamFI", {
                method: "GET",
                urlParameters: {
                    USER_EMAIL: sLoggedInUserEmail 
                },
                success: (oData) => {
                    if (oData && oData.results) {
                        const aTeamData = oData.results;
                        const oTeamModel = new JSONModel({
                            MyTeam: aTeamData
                        });
                        this.getView().setModel(oTeamModel, "team");
                        console.log("Team data loaded:", oTeamModel.getData());
                    } else {
                        console.log("No team data received.");
                        this.getView().setModel(new JSONModel({ MyTeam: [] }), "team");
                    }
                },
                error: (oError) => {
                    console.error("Error fetching team data:", oError);
                    MessageBox.error("Failed to load team data. Please try again.");
                }
            });
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
                this.getRouter().navTo("RouteView1", {}, true);
            }
        },
        onGiveFeedback() {
            this.getRouter().navTo("Route360FbPage");
        },
        onOpenManager() {
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
        onPegStatusFilterChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();

            var oTable = this.byId("pegTable");
            var oBinding = oTable.getBinding("items");

            if (sSelectedKey) {
                var oFilter = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, sSelectedKey);
                oBinding.filter([oFilter]);
            } else {
                oBinding.filter([]);
            }
        },
        onDateChange: function (oEvent) {
            const oDatePicker = oEvent.getSource();
            const oDate = oDatePicker.getDateValue();
            if (!oDate) {
                this.byId("pegTable").getBinding("items").filter([]);
                return;
            }

            const oFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" });
            const sFormattedDate = oFormat.format(oDate);

            const oFilter = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.EQ, sFormattedDate);
            const oTable = this.byId("pegTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter([oFilter]);
            this.byId("combobox1").setSelectedKey("");
        },
        onNewFeedback: function () {
            this.getRouter().navTo("RouteFeedbackPage");
        },
        onFbStatusFilterChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();

            var oTable = this.byId("FbTable");
            var oBinding = oTable.getBinding("items");

            if (sSelectedKey) {
                var oFilter = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, sSelectedKey);
                oBinding.filter([oFilter]);
            } else {
                oBinding.filter([]);
            }
        },
        onFbDateChange: function (oEvent) {
            const oDatePicker = oEvent.getSource();
            const oDate = oDatePicker.getDateValue();
            if (!oDate) {
                this.byId("FbTable").getBinding("items").filter([]);
                return;
            }

            const oFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" });
            const sFormattedDate = oFormat.format(oDate);

            const oFilter = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.EQ, sFormattedDate);
            const oTable = this.byId("FbTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter([oFilter]);
            this.byId("combobox3").setSelectedKey("");
        }
    });
});