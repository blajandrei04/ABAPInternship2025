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
            // Get the OData model from the component
            const oODataModel = this.getView().getModel();
            
            // Assuming the logged-in user's email is stored in a JSONModel named "user"
            const oUserModel = this.getView().getModel("user");
            if (oUserModel) {
                const sLoggedInUserEmail = oUserModel.getProperty("/userEmail");

                if (sLoggedInUserEmail) {
                    oODataModel.callFunction("/ViewTeamFI", {
                        method: "GET",
                        urlParameters: {
                            Email: sLoggedInUserEmail
                        },
                        success: (oData) => {
                            // The backend returns a list of team members, including the user
                            const aTeamMembers = oData.results;

                            // Filter out the logged-in user from the team list
                            const aColleagues = aTeamMembers.filter(member => member.EMAIL !== sLoggedInUserEmail);
                            
                            // Create a new JSON Model with the filtered data and set it to the view
                            const oTeamModel = new JSONModel({ MyTeam: aColleagues });
                            this.getView().setModel(oTeamModel, "team");

                            // Re-bind the table items to the new model
                            const oTable = this.byId("myTeamTable");
                            oTable.bindItems({
                                path: "team>/MyTeam",
                                template: new sap.m.ColumnListItem({
                                    cells: [
                                        new sap.m.Text({ text: "{team>FIRST_NAME}" }),
                                        new sap.m.Text({ text: "{team>LAST_NAME}" }),
                                        new sap.m.Text({ text: "{team>CAREER_LEVEL}" })
                                    ]
                                })
                            });
                        },
                        error: (oError) => {
                            console.error("Error fetching team data:", oError);
                            MessageBox.error("Failed to load team data. Please try again.");
                        }
                    });
                } else {
                    console.error("No logged-in user email found.");
                }
            } else {
                console.error("User model not found.");
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