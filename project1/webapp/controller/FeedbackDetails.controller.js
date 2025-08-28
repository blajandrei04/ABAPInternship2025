// blajandrei04/abapinternship2025/ABAPInternship2025-e6ef9f2d76748331a678f4ef55dbc0841d37968d/project1/webapp/controller/FeedbackDetails.controller.js
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/core/format/DateFormat"
], (Controller, History, DateFormat) => {
  "use strict";

  return Controller.extend("project1.controller.FeedbackDetails", {
    onInit: function () {
      this.getOwnerComponent().getRouter()
        .getRoute("RouteFeedbackDetails")
        .attachPatternMatched(this._onObjectMatched, this);
    },

    formatter: {
      formatDate: function (oDate) {
        if (oDate) {
          const oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "dd.MM.yyyy"
          });
          return oDateFormat.format(new Date(oDate));
        }
        return "";
      }
    },

    _onObjectMatched: function () {
      const oViewModel = this.getOwnerComponent().getModel("view");
      const oSelectedFeedback = oViewModel.getProperty("/selectedFeedback");

      if (oSelectedFeedback) {
          this.getView().byId("FeedbackDetailsPage").setBindingContext(
              oViewModel.createBindingContext("/selectedFeedback"), "view"
          );
          console.log("[FeedbackDetails] Binding context set successfully.");
      } else {
          console.warn("[FeedbackDetails] No selected feedback data found in the model.");
      }
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
    }
  });
});