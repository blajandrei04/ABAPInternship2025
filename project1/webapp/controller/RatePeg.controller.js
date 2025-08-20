sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/m/MessageBox"
], (BaseController, History, MessageBox) => {
  "use strict";

  return BaseController.extend("project1.controller.360Fb", {
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
      console.log("Am primit FB_ID:", sFbId);

      const oModel = this.getView().getModel();
      oModel.setProperty("/FB_ID", sFbId);

      // daca vrei toate datele PEG-ului selectat
      const oPegData = this.getOwnerComponent().getModel("pegData");
      if (oPegData) {
        const aPegs = oPegData.getProperty("/Pegs") || [];
        const oSelectedPeg = aPegs.find(p => p.FB_ID === sFbId);
        if (oSelectedPeg) {
          oModel.setProperty("/SelectedPeg", oSelectedPeg);
          console.log("PEG selectat:", oSelectedPeg);
        }
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
      const sTechRating = oView.byId("technicalSkillsRating").getSelectedKey();
      const sSoftRating = oView.byId("softSkillsRating").getSelectedKey();
      const sOtherRating = oView.byId("otherSkillsRating").getSelectedKey();
      const sExpertiseRating = oView.byId("expertiseRating").getSelectedKey();
      const sNetworkingRating = oView.byId("networkingSkillsRating").getSelectedKey();
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