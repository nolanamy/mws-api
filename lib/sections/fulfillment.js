'use strict';

const _ = require('lodash');
const Enum = require('../enum');
const Type = require('../types');

const list = true;
const required = true;

const fulfillmentRequestDefaults = {
    name: 'Fulfillment',
    version: '2010-10-01'
};

const inboundRequestDefaults = _.defaults({
    group: 'Inbound Shipments',
    path: '/FulfillmentInboundShipment/2010-10-01',
    nextName: 'FulfillmentInboundShipment'
}, fulfillmentRequestDefaults);

const inventoryRequestDefaults = _.defaults({
    group: 'Inventory',
    path: '/FulfillmentInventory/2010-10-01',
    nextName: 'FulfillmentInventory'
}, fulfillmentRequestDefaults);

const outboundRequestDefaults = _.defaults({
    group: 'Outbound Shipments',
    path: '/FulfillmentOutboundShipment/2010-10-01',
    nextName: 'FulfillmentOutboundShipment'
}, fulfillmentRequestDefaults);

const sharedObjects = {
    inboundShipmentItems: {
        name: 'InboundShipmentItems.member', required, list, type: Type.OBJECT,
        params: {
            QuantityShipped: { required, type: Type.INTEGER },
            SellerSKU: { required },
        }
    },
    inboundShipmentPlanRequestItems: {
        name: 'InboundShipmentPlanRequestItems.member', required, list, type: Type.OBJECT,
        params: {
            SellerSKU: { required },
            ASIN: {},
            Quantity: { required, type: Type.INTEGER },
            Condition: {},
        }
    },
    createUpdateLineItems: {
        name: 'Items.member', required, list, type: Type.OBJECT,
        params: {
            DisplayableComment: {},
            GiftMessage: {},
            'PerUnitDeclaredValue.Value': {},
            'PerUnitDeclaredValue.CurrencyCode': {},
            Quantity: { required, type: Type.INTEGER },
            SellerFulfillmentOrderItemId: { required },
            SellerSKU: { required }
        }
    },
    previewLineItems: {
        name: 'Items.member', required, list, type: Type.OBJECT,
        params: {
            Quantity: { required, type: Type.INTEGER },
            SellerFulfillmentOrderItemId: {},
            SellerSKU: { required },
            EstimatedShippingWeight: {},
            ShippingWeightCalculationMethod: {},
        }
    }
};

const enums = {
    ResponseGroups() {
        return new Enum(['Basic', 'Detailed']);
    },
    ShippingSpeedCategories() {
        return new Enum(['Standard', 'Expedited', 'Priority']);
    },
    FulfillmentPolicies() {
        return new Enum(['FillOrKill', 'FillAll', 'FillAllAvailable']);
    }
};

const requests = {
    // Inbound Shipments
    Inbound: {
        GetServiceStatus: {},

        CreateInboundShipment: {
            params: {
                ShipmentId: { required },
                ShipmentName: { name: 'InboundShipmentHeader.ShipmentName', required },
                ShipFromName: { name: 'InboundShipmentHeader.ShipFromAddress.Name', required },
                ShipFromAddressLine1: { name: 'InboundShipmentHeader.ShipFromAddress.AddressLine1', required },
                ShipFromAddressLine2: { name: 'InboundShipmentHeader.ShipFromAddress.AddressLine2' },
                ShipFromAddressCity: { name: 'InboundShipmentHeader.ShipFromAddress.City', required },
                ShipFromDistrictOrCounty: { name: 'InboundShipmentHeader.ShipFromAddress.DistrictOrCounty' },
                ShipFromStateOrProvince: { name: 'InboundShipmentHeader.ShipFromAddress.StateOrProvinceCode', required },
                ShipFromPostalCode: { name: 'InboundShipmentHeader.ShipFromAddress.PostalCode', required },
                ShipFromCountryCode: { name: 'InboundShipmentHeader.ShipFromAddress.CountryCode', required },
                DestinationFulfillmentCenterId: { name: 'InboundShipmentHeader.DestinationFulfillmentCenterId', required },
                ShipmentStatus: { name: 'InboundShipmentHeader.ShipmentStatus' },
                LabelPrepPreference: { name: 'InboundShipmentHeader.LabelPrepPreference' },
                InboundShipmentItems: sharedObjects.inboundShipmentItems
            }
        },

        CreateInboundShipmentPlan: {
            params: {
                LabelPrepPreference: { required },
                ShipFromName: { name: 'ShipFromAddress.Name' },
                ShipFromAddressLine1: { name: 'ShipFromAddress.AddressLine1' },
                ShipFromCity: { name: 'ShipFromAddress.City' },
                ShipFromStateOrProvince: { name: 'ShipFromAddress.StateOrProvinceCode' },
                ShipFromPostalCode: { name: 'ShipFromAddress.PostalCode' },
                ShipFromCountryCode: { name: 'ShipFromAddress.CountryCode' },
                ShipFromAddressLine2: { name: 'ShipFromAddress.AddressLine2' },
                ShipFromDistrictOrCounty: { name: 'ShipFromAddress.DistrictOrCounty' },
                InboundShipmentPlanRequestItems: sharedObjects.inboundShipmentPlanRequestItems
            }
        },

        ListInboundShipmentItems: {
            params: {
                ShipmentId: { required },
                LastUpdatedAfter: { type: Type.TIMESTAMP },
                LastUpdatedBefore: { type: Type.TIMESTAMP }
            }
        },

        ListInboundShipmentItemsByNextToken: {
            params: {
                NextToken: { required }
            }
        },

        ListInboundShipments: {
            params: {
                ShipmentStatuses: { name: 'ShipmentStatusList.member', list },
                ShipmentIds: { name: 'ShipmentIdList.member', list },
                LastUpdatedAfter: { type: Type.TIMESTAMP },
                LastUpdatedBefore: { type: Type.TIMESTAMP }
            }
        },

        ListInboundShipmentsByNextToken: {
            params: {
                NextToken: { required }
            }
        },

        UpdateInboundShipment: {
            params: {
                ShipmentId: { required },
                ShipmentName: { name: 'InboundShipmentHeader.ShipmentName', required },
                ShipFromName: { name: 'InboundShipmentHeader.ShipFromAddress.Name', required },
                ShipFromAddressLine1: { name: 'InboundShipmentHeader.ShipFromAddress.AddressLine1', required },
                ShipFromAddressLine2: { name: 'InboundShipmentHeader.ShipFromAddress.AddressLine2' },
                ShipFromAddressCity: { name: 'InboundShipmentHeader.ShipFromAddress.City', required },
                ShipFromDistrictOrCounty: { name: 'InboundShipmentHeader.ShipFromAddress.DistrictOrCounty' },
                ShipFromStateOrProvince: { name: 'InboundShipmentHeader.ShipFromAddress.StateOrProvinceCode', required },
                ShipFromPostalCode: { name: 'InboundShipmentHeader.ShipFromAddress.PostalCode', required },
                ShipFromCountryCode: { name: 'InboundShipmentHeader.ShipFromAddress.CountryCode', required },
                DestinationFulfillmentCenterId: { name: 'InboundShipmentHeader.DestinationFulfillmentCenterId', required },
                ShipmentStatus: { name: 'InboundShipmentHeader.ShipmentStatus' },
                LabelPrepPreference: { name: 'InboundShipmentHeader.LabelPrepPreference' },
                InboundShipmentItems: sharedObjects.inboundShipmentItems
            }
        }
    },

    // Inventory
    Inventory: {
        GetServiceStatus: {},

        ListInventorySupply: {
            params: {
                SellerSkus: { name: 'SellerSkus.member', list },
                QueryStartDateTime: { type: Type.TIMESTAMP },
                ResponseGroup: {}
            }
        },

        ListInventorySupplyByNextToken: {
            params: {
                NextToken: { required }
            }
        }
    },

    // Outbound Shipments
    Outbound: {
        GetServiceStatus: {},

        CancelFulfillmentOrder: {
            params: {
                SellerFulfillmentOrderId: { required }
            }
        },

        CreateFulfillmentOrder: {
            params: {
                SellerFulfillmentOrderId: { required },
                ShippingSpeedCategory: { required, type: 'fba.ShippingSpeedCategory' },
                DisplayableOrderId: { required },
                DisplayableOrderDateTime: { required, type: Type.TIMESTAMP },
                DisplayableOrderComment: { required },
                FulfillmentAction: {},
                FulfillmentPolicy: { type: 'fba.FulfillmentPolicy' },
                FulfillmentMethod: {},
                NotificationEmails: { name: 'NotificationEmailList.member', list },
                DestName: { name: 'DestinationAddress.Name' },
                DestAddressLine1: { name: 'DestinationAddress.Line1' },
                DestAddressLine2: { name: 'DestinationAddress.Line2' },
                DestAddressLine3: { name: 'DestinationAddress.Line3' },
                DestCity: { name: 'DestinationAddress.City' },
                DestStateOrProvince: { name: 'DestinationAddress.StateOrProvinceCode' },
                DestPostalCode: { name: 'DestinationAddress.PostalCode' },
                DestCountryCode: { name: 'DestinationAddress.CountryCode' },
                DestDistrictOrCounty: { name: 'DestinationAddress.DistrictOrCounty' },
                DestPhoneNumber: { name: 'DestinationAddress.PhoneNumber' },
                LineItems: sharedObjects.createUpdateLineItems
            }
        },

        GetFulfillmentOrder: {
            params: {
                SellerFulfillmentOrderId: { required }
            }
        },

        GetFulfillmentPreview: {
            params: {
                ToName: { name: 'Address.Name' },
                ToAddressLine1: { name: 'Address.Line1' },
                ToAddressLine2: { name: 'Address.Line2' },
                ToAddressLine3: { name: 'Address.Line3' },
                ToCity: { name: 'Address.City' },
                ToStateOrProvince: { name: 'Address.StateOrProvinceCode' },
                ToPostalCode: { name: 'Address.PostalCode' },
                ToCountry: { name: 'Address.CountryCode' },
                ToDistrictOrCounty: { name: 'Address.DistrictOrCounty' },
                ToPhoneNumber: { name: 'Address.PhoneNumber' },
                ShippingSpeeds: { name: 'ShippingSpeedCategories.member', list, type: 'fba.ShippingSpeedCategory' },
                LineItems: sharedObjects.previewLineItems
             }
        },

        ListAllFulfillmentOrders: {
            params: {
                QueryStartDateTime: { required, type: Type.TIMESTAMP },
                FulfillentMethods: { name: 'FulfillmentMethod.member', list }
            }
        },

        ListAllFulfillmentOrdersByNextToken: {
            params: {
                NextToken: { required }
            }
        },

        UpdateFulfillmentOrder: {
            params: {
                SellerFulfillmentOrderId: { required },
                ShippingSpeedCategory: { type: 'fba.ShippingSpeedCategory' },
                DisplayableOrderId: {},
                DisplayableOrderDateTime: { type: Type.DATE },
                DisplayableOrderComment: {},
                FulfillmentPolicy: { type: 'fba.FulfillmentPolicy' },
                FulfillmentAction: {},
                NotificationEmails: { name: 'NotificationEmailList.member', list },
                DestName: { name: 'DestinationAddress.Name' },
                DestAddressLine1: { name: 'DestinationAddress.Line1' },
                DestAddressLine2: { name: 'DestinationAddress.Line2' },
                DestAddressLine3: { name: 'DestinationAddress.Line3' },
                DestCity: { name: 'DestinationAddress.City' },
                DestStateOrProvince: { name: 'DestinationAddress.StateOrProvinceCode' },
                DestPostalCode: { name: 'DestinationAddress.PostalCode' },
                DestCountryCode: { name: 'DestinationAddress.CountryCode' },
                DestDistrictOrCounty: { name: 'DestinationAddress.DistrictOrCounty' },
                DestPhoneNumber: { name: 'DestinationAddress.PhoneNumber' },
                LineItems: sharedObjects.createUpdateLineItems
            }
        }
    }
};

module.exports = {
    enums,
    Inbound: {
        requests: requests.Inbound,
        requestDefaults: inboundRequestDefaults
    },
    Inventory: {
        requests: requests.Inventory,
        requestDefaults: inventoryRequestDefaults
    },
    Outbound: {
        requests: requests.Outbound,
        requestDefaults: outboundRequestDefaults
    },
    requests
};
