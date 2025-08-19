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
        _oPegDialog: null,
        _oChangePassDialog: null,

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
                        const oTeamModel = new JSONModel({ MyTeam: aTeamData });
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
            if (!this._oPegDialog) {
                this._oPegDialog = await this.loadFragment({
                    name: "project1.view.PegDialog",
                    controller: this
                });
                this.getView().addDependent(this._oPegDialog);
            }

            const oODataModel = this.getOwnerComponent().getModel();
            oODataModel.read("/EMPLOYEESet", {
                success: (oData) => {
                    const aProjectData = [...new Set(oData.results.map(item => item.TEAM_ID))]
                        .filter(id => id)
                        .map(id => ({ PROJECT_ID: id }));
                    this.getView().setModel(new JSONModel({ Projects: aProjectData }), "projects");

                    const aManagers = oData.results.filter(item => item.SU && String(item.SU).toUpperCase() === 'TRUE');
                    this.getView().setModel(new JSONModel({ Managers: aManagers }), "managers");

                    this._oPegDialog.open();
                },
                error: (oError) => {
                    console.error("Failed to load project and manager lists:", oError);
                    MessageBox.error("Failed to load project and manager lists.");
                }
            });
        },
        onSendPegRequest: function () {
            if (!this._oPegDialog) {
                MessageBox.error("The PEG request dialog is not available.");
                return;
            }
            const oProjectComboBox = this.getView().byId("projectComboBox");
            const oManagerComboBox = this.getView().byId("managerComboBox");
            const sProjectId = oProjectComboBox.getSelectedKey();
            const sManagerEmail = oManagerComboBox.getSelectedKey();
            const oUserModel = this.getOwnerComponent().getModel("user");
            const sLoggedInUserEmail = oUserModel.getProperty("/USER_EMAIL");

            if (!sProjectId || !sManagerEmail) {
                MessageBox.error("Please select a project and a manager.");
                return;
            }

            const oODataModel = this.getOwnerComponent().getModel();
            oODataModel.callFunction("/RequestPEG_FI", {
                method: "POST",
                urlParameters: {
                    EMAIL: sLoggedInUserEmail,
                    PROJECT_NAME: sProjectId, // The corrected parameter name
                    SENDER_NAME: sManagerEmail
                },
                success: (oData) => {
                    MessageToast.show("PEG request sent successfully!");
                    this.onClosePegDialog();
                    this.onTabSelect({ getParameter: () => "Pegs" });
                },
                error: (oError) => {
                    console.error("Failed to send PEG request:", oError);
                    MessageBox.error("Failed to send PEG request. Please try again.");
                }
            });
        },
        async onChangePasswordPress() {
            if (!this._oChangePassDialog) {
                this._oChangePassDialog = await this.loadFragment({
                    name: "project1.view.ChangePass",
                });
            }
            this._oChangePassDialog.open();
        },
        onClosePegDialog() {
            if (this._oPegDialog) {
                this._oPegDialog.close();
            }
        },
        onConfirmChangePassword: function () {
            const oView = this.getView();
            const sNewPassword = oView.byId("changeEmailInput1").getValue().trim();
            const sConfirmationPassword = oView.byId("changeEmailInput12").getValue().trim();
            if (!sNewPassword || !sConfirmationPassword) {
                MessageBox.error("Please fill in all fields.");
                return;
            }
            if (sNewPassword !== sConfirmationPassword) {
                MessageBox.error("Passwords do not match.");
                return;
            }
            const oUserModel = this.getOwnerComponent().getModel("user");
            const sEmail = oUserModel.getProperty("/USER_EMAIL").toUpperCase();
            const sPassword = sNewPassword.toUpperCase();
            const sPassword1 = sConfirmationPassword.toUpperCase();
            const oODataModel = this.getOwnerComponent().getModel();
            oODataModel.callFunction("/ForgotPassword", {
                method: "POST",
                urlParameters: {
                    EMAIL: sEmail,
                    PASSWORD: sPassword,
                    PASSWORD1: sPassword1
                },
                success: (oData) => {
                    MessageToast.show("Password changed successfully!");
                    this.onCloseDialog();
                },
                error: (oError) => {
                    console.error("Change Password failed:", oError);
                    MessageBox.error("Failed to change password. Please try again.");
                }
            });
        },
        onCloseDialog() {
            if (this._oChangePassDialog) {
                this._oChangePassDialog.close();
            }
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
                var oFilter = new sap.ui.model.Filter("FB_STATUS", sap.ui.model.FilterOperator.EQ, sSelectedKey);
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
            const oFilter = new sap.ui.model.Filter("FB_DATE", sap.ui.model.FilterOperator.EQ, sFormattedDate);
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
                var oFilter = new sap.ui.model.Filter("FB_STATUS", sap.ui.model.FilterOperator.EQ, sSelectedKey);
                oBinding.filter([oFilter]);
            } else {
                oBinding.filter([]);
            }
        },
        onTabSelect(oEvent) {
            const sSelectedKey = oEvent.getParameter("key");
            const oUserModel = this.getOwnerComponent().getModel("user");
            const sLoggedInUserEmail = oUserModel.getProperty("/USER_EMAIL");
            const bIsManager = oUserModel.getProperty("/SU"); // verificam flag-ul SU
            const oODataModel = this.getOwnerComponent().getModel();

            if (sSelectedKey === "Pegs") {
                // alegem functia in functie de SU
                const sFunctionName = (bIsManager === true || bIsManager === "TRUE" || bIsManager === "X")
                    ? "/GetPEG_MNG"
                    : "/GetPEG_FI";

                oODataModel.callFunction(sFunctionName, {
                    method: "GET",
                    urlParameters: { EMAIL: sLoggedInUserEmail },
                    success: (oData) => {
                        const aPegData = (oData && oData.results) ? oData.results : [];
                        this.getView().setModel(new sap.ui.model.json.JSONModel({ Pegs: aPegData }), "pegData");
                        console.log(`Peg data loaded (${sFunctionName}):`, aPegData);
                    },
                    error: (oError) => {
                        console.error(`Error fetching peg data (${sFunctionName}):`, oError);
                        MessageBox.error("Failed to load peg data.");
                        this.getView().setModel(new sap.ui.model.json.JSONModel({ Pegs: [] }), "pegData");
                    }
                });
            }

            else if (sSelectedKey === "360FB") {
                oODataModel.callFunction("/Get360", {
                    method: "GET",
                    urlParameters: { EMAIL: sLoggedInUserEmail },
                    success: (oData) => {
                        const aFbData = (oData && oData.results) ? oData.results : [];
                        this.getView().setModel(new sap.ui.model.json.JSONModel({ Feedbacks: aFbData }), "fbData");
                        console.log("360 Feedback data loaded:", aFbData);
                    },
                    error: (oError) => {
                        console.error("Error fetching 360 feedback data:", oError);
                        MessageBox.error("Failed to load 360 feedback data.");
                        this.getView().setModel(new sap.ui.model.json.JSONModel({ Feedbacks: [] }), "fbData");
                    }
                });
            }
        }
        ,
        onFbDateChange: function (oEvent) {
            const oDatePicker = oEvent.getSource();
            const oDate = oDatePicker.getDateValue();
            if (!oDate) {
                this.byId("FbTable").getBinding("items").filter([]);
                return;
            }
            const oFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" });
            const sFormattedDate = oFormat.format(oDate);
            const oFilter = new sap.ui.model.Filter("FB_DATE", sap.ui.model.FilterOperator.EQ, sFormattedDate);
            const oTable = this.byId("FbTable");
            const oBinding = oTable.getBinding("items");
            oBinding.filter([oFilter]);
            this.byId("combobox3").setSelectedKey("");
        },
        onItemPressed: function() {
            console.log("Item press triggered");

            this.getRouter().navTo("RouteRatePegPage");
        }
    });
});