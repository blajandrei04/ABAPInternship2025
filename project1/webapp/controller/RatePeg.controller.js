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
      console.log("Am primit FB_ID in RatePeg:", sFbId);

      const oModel = this.getView().getModel();
      oModel.setProperty("/FB_ID", sFbId);

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

          // punem datele in model si atat
          this.getView().setModel(new sap.ui.model.json.JSONModel(d), "pegDetails");
          console.log("Model setat pe view:", d);
        }.bind(this),
        error: function (oError) {
          console.error("Eroare la citirea FB_CATSet in RatePeg:", oError);
        }
      });
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