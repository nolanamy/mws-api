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

const sharedAddress = {
  Name: { required },
  City: { required }, // sorta; not used in Japan
  StateOrProvinceCode: { required }, // sorta; not required for inbound shipments
  PostalCode: { required }, // sorta; not always required
  CountryCode: { required },
  DistrictOrCounty: {},
};

// http://docs.developer.amazonservices.com/en_US/fba_outbound/FBAOutbound_Datatypes.html#Address
const outboundAddress = _.assign({
  Line1: { required },
  Line2: {},
  Line3: {},
  PhoneNumber: {},
}, sharedAddress);

// http://docs.developer.amazonservices.com/en_US/fba_inbound/FBAInbound_Datatypes.html#Address
const inboundAddress = _.assign({
  AddressLine1: { required },
  AddressLine2: {},
}, sharedAddress);

function cloneAndPrefixKeys(object, prefix) {
    return _.mapKeys(_.cloneDeep(object), (_, key) => {
        return prefix + '.' + key;
    })
}

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
            params: _.assign({
                ShipmentId: { required },
                ShipmentName: { name: 'InboundShipmentHeader.ShipmentName', required },
                DestinationFulfillmentCenterId: { name: 'InboundShipmentHeader.DestinationFulfillmentCenterId', required },
                ShipmentStatus: { name: 'InboundShipmentHeader.ShipmentStatus' },
                LabelPrepPreference: { name: 'InboundShipmentHeader.LabelPrepPreference' },
                InboundShipmentItems: sharedObjects.inboundShipmentItems
            }, cloneAndPrefixKeys(inboundAddress, 'InboundShipmentHeader.ShipFromAddress'))
        },

        CreateInboundShipmentPlan: {
            params: _.assign({
                LabelPrepPreference: { required },
                InboundShipmentPlanRequestItems: sharedObjects.inboundShipmentPlanRequestItems
            }, cloneAndPrefixKeys(inboundAddress, 'ShipFromAddress'))
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
            params: _.assign({
                ShipmentId: { required },
                ShipmentName: { name: 'InboundShipmentHeader.ShipmentName', required },
                DestinationFulfillmentCenterId: { name: 'InboundShipmentHeader.DestinationFulfillmentCenterId', required },
                ShipmentStatus: { name: 'InboundShipmentHeader.ShipmentStatus' },
                LabelPrepPreference: { name: 'InboundShipmentHeader.LabelPrepPreference' },
                InboundShipmentItems: sharedObjects.inboundShipmentItems
            }, cloneAndPrefixKeys(inboundAddress, 'InboundShipmentHeader.ShipFromAddress'))
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
            params: _.assign({
                MarketplaceId: {},
                SellerFulfillmentOrderId: { required },
                ShippingSpeedCategory: { required, type: 'fba.ShippingSpeedCategory' },
                DisplayableOrderId: { required },
                DisplayableOrderDateTime: { required, type: Type.TIMESTAMP },
                DisplayableOrderComment: { required },
                FulfillmentAction: {},
                FulfillmentPolicy: { type: 'fba.FulfillmentPolicy' },
                FulfillmentMethod: {},
                NotificationEmails: { name: 'NotificationEmailList.member', list },
                LineItems: sharedObjects.createUpdateLineItems
            }, cloneAndPrefixKeys(outboundAddress, 'DestinationAddress'))
        },

        GetFulfillmentOrder: {
            params: {
                SellerFulfillmentOrderId: { required }
            }
        },

        GetFulfillmentPreview: {
            params: _.assign({
                MarketplaceId: {},
                ShippingSpeeds: { name: 'ShippingSpeedCategories.member', list, type: 'fba.ShippingSpeedCategory' },
                LineItems: sharedObjects.previewLineItems
            }, cloneAndPrefixKeys(outboundAddress, 'Address'))
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
            params: _.assign({
                MarketplaceId: {},
                SellerFulfillmentOrderId: { required },
                ShippingSpeedCategory: { type: 'fba.ShippingSpeedCategory' },
                DisplayableOrderId: {},
                DisplayableOrderDateTime: { type: Type.DATE },
                DisplayableOrderComment: {},
                FulfillmentPolicy: { type: 'fba.FulfillmentPolicy' },
                FulfillmentAction: {},
                NotificationEmails: { name: 'NotificationEmailList.member', list },
                LineItems: sharedObjects.createUpdateLineItems
            }, cloneAndPrefixKeys(outboundAddress, 'DestinationAddress'))
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
