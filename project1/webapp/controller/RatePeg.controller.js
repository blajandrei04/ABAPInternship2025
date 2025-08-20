sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/m/MessageBox"
], (BaseController, History, MessageBox) => {
  "use strict";

  return BaseController.extend("project1.controller.360Fb", {
    onInit() {
      var oModel = new sap.ui.model.json.JSONModel({
        ExpertiseRating: "",  // cheia selectata
        ExpertiseComment: ""  // comentariu
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
        this.getRouter().navTo("RouteHomePage", {}, true /*no history*/);
      }
    },
    onSaveChanges: function () {
      var oView = this.getView();

      // luam toate valorile (cheile)
      var sTechSkills = oView.byId("technicalSkillsRating").getSelectedKey();
      var sSoftSkills = oView.byId("softSkillsRating").getSelectedKey();
      var sOtherSkills = oView.byId("otherSkillsRating").getSelectedKey();
      var sExpertise = oView.byId("expertiseRating").getSelectedKey();
      var sNetworking = oView.byId("networkingSkillsRating").getSelectedKey();

      // luam comentariul
      var sComment = oView.byId("expertiseComment").getValue();

      // pregatim mesajul
      var sMessage =
        "Technical Skills: " + sTechSkills + "\n" +
        "Soft Skills: " + sSoftSkills + "\n" +
        "Other Skills: " + sOtherSkills + "\n" +
        "Expertise: " + sExpertise + "\n" +
        "Networking Skills: " + sNetworking + "\n\n" +
        "Comment: " + sComment;

      // afisam in MessageBox
      sap.m.MessageBox.information(sMessage, {
        title: "Saved Changes"
      });
    }



  });
});