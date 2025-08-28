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
                anonymous: false,
                Users: [],
                Projects: [],
                technicalSkillsRating: null,
                technicalSkillsComment: "",
                softSkillsRating: null,
                softSkillsComment: "",
                otherSkillsRating: null,
                otherSkillsComment: ""
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
                        console.log("Users loaded successfully.");
                    } else {
                        console.log("No user data received.");
                    }
                },
                error: (oError) => {
                    console.error("Failed to load user data:", oError);
                    MessageBox.error("Failed to load user list. Please try again.");
                }
            });

            oODataModel.read("/ProjectSet", {
                success: (oData) => {
                    if (oData && oData.results) {
                        const aProjects = oData.results.map(item => ({
                            ProjectID: item.PROJECT_ID,
                            ProjectName: item.PROJECT_NAME
                        }));
                       oViewModel.setProperty("/Projects", aProjects);
                        console.log("Projects loaded successfully.");
                    } else {
                        console.log("No project data received.");
                    }
                },
                error: (oError) => {
                    console.error("Failed to load project data:", oError);
                    MessageBox.error("Failed to load project list. Please try again.");
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
            const oViewModel = this.getView().getModel();
            const oUserModel = this.getOwnerComponent().getModel("user");
            
            const oSendButton = this.getView().byId("sendFeedbackButton");

            if (!oUserModel || !oUserModel.getProperty("/isLoggedIn")) {
                MessageBox.error("You must be logged in to send feedback.");
                return;
            }

            const sLoggedInUserEmail = oUserModel.getProperty("/USER_EMAIL");
            const sReceiverID = oViewModel.getProperty("/ReceiverID");
            const sProjectID = oViewModel.getProperty("/ProjectID");
            const bAnonymous = oViewModel.getProperty("/anonymous");

            if (!sReceiverID || !sProjectID) {
                MessageBox.warning("Please select a User and a Project.");
                return;
            }

            const aCategories = [
                { name: "Technical", rating: oViewModel.getProperty("/technicalSkillsRating"), comment: oViewModel.getProperty("/technicalSkillsComment") },
                { name: "Soft", rating: oViewModel.getProperty("/softSkillsRating"), comment: oViewModel.getProperty("/softSkillsComment") },
                { name: "Other", rating: oViewModel.getProperty("/otherSkillsRating"), comment: oViewModel.getProperty("/otherSkillsComment") }
            ];

            let aRatingsFound = [];

            aCategories.forEach(category => {
                if (category.rating) {
                    aRatingsFound.push(category);
                }
            });

            if (aRatingsFound.length > 1) {
                MessageBox.warning("Please provide a rating for only one category at a time.");
                return;
            }

            if (aRatingsFound.length === 0) {
                MessageBox.warning("Please provide a rating for at least one category.");
                return;
            }
            
            const oCategory = aRatingsFound[0];

            const aProjects = oViewModel.getProperty("/Projects");
            const sProjectName = aProjects.find(p => p.ProjectID === sProjectID)?.ProjectName;

            const oParameters = {
                EMAIL: sLoggedInUserEmail,
                RECEIVER_NAME: sReceiverID,
                PROJECT_ID: sProjectID, 
                PROJECT_NAME: sProjectName,
                ANONYMITY: bAnonymous ? "X" : " ",
                CATEGORY_COMMENT: oCategory.comment,
                CATEGORY_RATING: parseInt(oCategory.rating, 10),
                CATEGORY_NAME: oCategory.name
            };
            
            oODataModel.callFunction("/New_360", {
                method: "POST",
                urlParameters: oParameters,
                success: () => {
                    MessageToast.show(`Feedback for ${oCategory.name} sent successfully!`);
                    if (oSendButton) {
                        oSendButton.blur();
                    }
                    this.onNavBack();
                },
                error: (oError) => {
                    console.error(`Failed to send feedback for ${oCategory.name}:`, oError);
                    MessageBox.error(`An error occurred while sending feedback for ${oCategory.name}. Please try again.`);
                }
            });
        }
    });
});