sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel", 
    "project1/model/models"
], (UIComponent, JSONModel, models) => {
    "use strict";

    return UIComponent.extend("project1.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // load local JSON file as model
            var oTestDataModel = new sap.ui.model.json.JSONModel();
            oTestDataModel.loadData("model/test_data.json");
            this.setModel(oTestDataModel, "test_data");


            // enable routing
            this.getRouter().initialize();
        }
    });
});