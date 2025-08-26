sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/m/MessageBox"
], (BaseController, History, MessageBox) => {
  "use strict";
 
  return BaseController.extend("project1.controller.RatePeg", {
    onInit: function () {
      // cream un model gol pentru view
      var oModel = new sap.ui.model.json.JSONModel({
        FB_ID: "",
        SelectedPeg: {}
      });
      this.getView().setModel(oModel);
 
      this.getOwnerComponent().getRouter()
        .getRoute("RouteRatePeg")
        .attachPatternMatched(this._onObjectMatched, this);
    }
    ,
 
    _onObjectMatched: function (oEvent) {
      const sFbId = oEvent.getParameter("arguments").fbId;
      const sStatus = oEvent.getParameter("arguments").status; // vine din navTo()
 
      console.log("[RatePeg] Am primit FB_ID:", sFbId, "STATUS:", sStatus);
 
      // salvam in modelul default pentru buton + binding la editable
      const oModel = this.getView().getModel();
      oModel.setProperty("/FB_ID", sFbId);
      oModel.setProperty("/STATUS", sStatus);
 
      if (sStatus === "COMPLETED") {
        // citim din backend doar daca e COMPLETED
        const oODataModel = this.getOwnerComponent().getModel();
        oODataModel.read("/FB_CATSet('" + sFbId + "')", {
          success: function (oData) {
            var d = oData.d || oData;
 
            // convertim la string pt. selectedKey pe ComboBox-uri
            ["CAT_TECHNICAL", "CAT_SOFT", "CAT_OTHER", "CAT_EXPERTISE", "CAT_NETWORK"].forEach(function (k) {
              if (d[k] !== undefined && d[k] !== null) {
                d[k] = String(d[k]);
              }
            });
 
            // setam datele in model separat pentru UI
            this.getView().setModel(new sap.ui.model.json.JSONModel(d), "pegDetails");
            console.log("[RatePeg] COMPLETED → date incarcate din backend:", d);
          }.bind(this),
          error: function (oError) {
            console.error("Eroare la citirea FB_CATSet in RatePeg:", oError);
            // fallback → setam campuri goale
            this.getView().setModel(new sap.ui.model.json.JSONModel({
              CATEGORY_COMMENT: "",
              CAT_TECHNICAL: "",
              CAT_SOFT: "",
              CAT_OTHER: "",
              CAT_EXPERTISE: "",
              CAT_NETWORK: ""
            }), "pegDetails");
          }.bind(this)
        });
      } else {
        // daca e PENDING → punem model gol
        this.getView().setModel(new sap.ui.model.json.JSONModel({
          CATEGORY_COMMENT: "",
          CAT_TECHNICAL: "",
          CAT_SOFT: "",
          CAT_OTHER: "",
          CAT_EXPERTISE: "",
          CAT_NETWORK: ""
        }), "pegDetails");
        console.log("[RatePeg] PENDING → campuri goale setate in model");
      }
    }
 
 
    ,
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
        this.getRouter().navTo("RouteHomePage", {}, true /*no history*/);
      }
    },
    onSaveChanges: function () {
      const oView = this.getView();
      const oUserModel = this.getOwnerComponent().getModel("user");
      const sEmail = oUserModel.getProperty("/USER_EMAIL");
 
      const oModel = oView.getModel();
      const sFbId = oModel.getProperty("/FB_ID");
 
      // ia valorile din UI
      const sTechRating = oView.byId("PegTechnicalSkillsRating").getSelectedKey();
      const sSoftRating = oView.byId("PegSoftSkillsRating").getSelectedKey();
      const sOtherRating = oView.byId("PegOtherSkillsRating").getSelectedKey();
      const sExpertiseRating = oView.byId("PegExpertiseRating").getSelectedKey();
      const sNetworkingRating = oView.byId("PegNetworkingSkillsRating").getSelectedKey();
      const sComment = oView.byId("expertiseComment").getValue();
 
      const oODataModel = this.getOwnerComponent().getModel();
 
      // apelam function import-ul
      oODataModel.callFunction("/EditPEG_FI", {
        method: "POST",
        urlParameters: {
          EMAIL: sEmail,
          FB_ID: sFbId,
          FB_COMMENT: sComment,
          CAT_TECHNICAL: sTechRating,
          CAT_SOFT: sSoftRating,
          CAT_OTHER: sOtherRating,
          CAT_EXPERTISE: sExpertiseRating,
          CAT_NETWORK: sNetworkingRating
        },
        success: (oData) => {
          sap.m.MessageBox.success("Feedback-ul a fost salvat cu succes!");
          console.log("EditPEG_FI success:", oData);
        },
        error: (oError) => {
          sap.m.MessageBox.error("A aparut o eroare la salvarea feedback-ului.");
          console.error("EditPEG_FI error:", oError);
        }
      });
    }
 
  });
});
 