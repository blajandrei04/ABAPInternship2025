sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, History, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.Feedback", {
        onInit() {
            console.log("Feedback Controller initialized");
            const oViewModel = new JSONModel({
                ReceiverID: "",
                ProjectID: "",
                ExpertiseComment: "",
                OverallRating: "3",
                anonymous: false,
                Users: [],
                Projects: []
            });
            this.getView().setModel(oViewModel);
            this._loadUserAndProjectData();
        },

        _loadUserAndProjectData: function () {
            const oODataModel = this.getOwnerComponent().getModel();
            const oViewModel = this.getView().getModel();

            oODataModel.read("/EMPLOYEESet", {
                success: (oData) => {
                    if (oData && oData.results) {
                        const aUsers = oData.results.map(item => ({
                            ID: item.EMP_ID,
                            Name: item.FULL_NAME
                        }));
                        oViewModel.setProperty("/Users", aUsers);

                        const aProjects = [...new Set(oData.results.map(item => item.TEAM_ID))]
                            .filter(id => id)
                            .map(id => ({ ProjectID: id, ProjectName: id }));
                        oViewModel.setProperty("/Projects", aProjects);

                        console.log("Users and Projects loaded successfully.");
                    } else {
                        console.log("No data received for users and projects.");
                    }
                },
                error: (oError) => {
                    console.error("Failed to load user and project data:", oError);
                    MessageBox.error("Failed to load user and project lists. Please try again.");
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
                this.getRouter().navTo("RouteHomePage", {}, true);
            }
        },

        onSendFeedback: function () {
            const oODataModel = this.getOwnerComponent().getModel();
            const oViewModelData = this.getView().getModel().getData();
            const oUserModel = this.getOwnerComponent().getModel("user");
            
            // Get a reference to the button that was pressed
            const oSendButton = this.getView().byId("sendFeedbackButton");

            if (!oUserModel || !oUserModel.getProperty("/isLoggedIn")) {
                MessageBox.error("You must be logged in to send feedback.");
                return;
            }

            const sLoggedInUserEmail = oUserModel.getProperty("/USER_EMAIL");

            const oParameters = {
                EMAIL: sLoggedInUserEmail,
                RECEIVER_NAME: oViewModelData.ReceiverID,
                PROJECT_NAME: oViewModelData.ProjectID,
                ANONYMITY: oViewModelData.anonymous ? "X" : " ",
                CATEGORY_COMMENT: oViewModelData.ExpertiseComment,
                CATEGORY_RATING: parseInt(oViewModelData.OverallRating, 10),
                CATEGORY_NAME: "Overall"
            };

            if (!oParameters.RECEIVER_NAME || !oParameters.PROJECT_NAME || !oParameters.CATEGORY_RATING) {
                MessageBox.warning("Please fill in all required fields (User, Project, and Rating).");
                return;
            }
            
            oODataModel.callFunction("/New_360", {
                method: "POST",
                urlParameters: oParameters,
                success: (oData) => {
                    MessageBox.success("Feedback sent successfully!");
                    
                    // Blur the button to prevent the aria-hidden warning
                    if (oSendButton) {
                        oSendButton.blur();
                    }

                    this.onNavBack();
                },
                error: (oError) => {
                    MessageBox.error("An error occurred while sending feedback. Please try again.");
                    console.error("Function Import failed:", oError);
                }
            });
        }
    });
});