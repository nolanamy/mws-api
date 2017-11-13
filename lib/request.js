'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const Type = require('./types');

function getValueForParam(param, val) {
    switch (param.type) {
        case Type.TIMESTAMP:
            if (_.isString(val)) {
                val = new Date(val);
            }

            if (!_.isDate(val)) {
                throw new TypeError('Must be a date');
            }

            return val.toISOString();

        case Type.DATE:
            if (_.isString(val)) {
                val = new Date(val);
            }

            if (!_.isDate(val)) {
                throw new TypeError('Must be a date');
            }

            return val.toISOString().slice(0, 10);

        case Type.BOOLEAN:
            return String(!!val);

        case Type.OBJECT:
            return val;

        default:
            return val;
    }
}

function maybeArrayify(isArray, result) {
    if (isArray) {
        return _.compact(_.isArray(result) ? result : [result])
    }

    return result;
}

class AmazonMwsRequest {
    /**
     * Constructor for general MWS request objects, wrapped by api submodules to keep
     * things DRY, yet familiar despite whichever api is being implemented.
     *
     * @param {Object} options Settings to apply to new request instance.
     */
    constructor(options) {
        this.api = _.defaults(_.pick(options, 'path', 'version', 'legacy', 'upload'), {
            path: '/',
            version: '2009-01-01',
            legacy: false
        });
        this.action = options.action || 'GetServiceStatus';

        function deepDefaultNamesToKeys(object) {
            object = _.mapValues(object, (param, key) => {
                if (!param.name) {
                    param.name = key;
                }
                if (param.params) {
                    deepDefaultNamesToKeys(param.params);
                }
                return param;
            });
        }

        deepDefaultNamesToKeys(options.params);

        this.params = _.reduce(options.params, function (params, param, name) {
            const realName = param.name;

            params[realName] = param;

            return params;
        }, {});

        this.paramsMap = _.reduce(options.params, function (paramsMap, param, name) {
            const realName = param.name;

            paramsMap[name] = realName;

            return paramsMap;
        }, {});

        this.values = {};
        this.options = _.omit(options, 'path', 'version', 'legacy', 'upload', 'action', 'params');

        if (!this.options.basePath) {
            this.options.basePath = `${this.action}Response.${this.action}Result`;
        }

        if (!this.options.next) {
            const nextAction = /ByNextToken$/.test(this.action) ? this.action : `${this.action}ByNextToken`;
            const nextName = this.options.nextName || this.options.name;

            this.options.next = `${nextName}.${nextAction}`;
        }
    }

    getResult(data) {
        const path = `${this.options.basePath}` + (this.options.data ? `.${this.options.data}` : '');

        const isArray = this.options.isArray;
        return maybeArrayify(isArray, path ? _.get(data, path) : data);
    }

    getNextToken(data) {
        const nextTokenPath = `${this.options.basePath}.NextToken`;
        const nextToken = _.get(data, nextTokenPath);

        if (nextToken === 'none') {
            return null;
        }

        return nextToken;
    }

    /**
     * Handles the casting, renaming, and setting of individual request params.
     *
     * @param {String} param Key of parameter (not ALWAYS the same as the param name!)
     * @param {Mixed} value Value to assign to parameter
     * @return {Object} Current instance to allow function chaining
     */
    set(paramName, value) {
        // intentional `==`
        if (_.isObject(paramName) && value == null) {
            return this.setMultiple(paramName);
        }

        if (value !== null && value !== undefined) {
            if (paramName === 'Limit') {
                return this;
            }

            if (this.paramsMap[paramName]) {
                paramName = this.paramsMap[paramName];
            }

            const param = this.params[paramName];

            const getValue = _.partial(getValueForParam, param);

            // Lists need to be sequentially numbered and we take care of that here
            if (param.list) {
                const values = _.isArray(value) ? value : [value];

                _.forEach(values, (value, i) => {
                    const indexedName = `${param.name}.${i + 1}`;
                    this.assign(indexedName, getValue(value));
                });
            } else {
                this.assign(param.name, getValue(value));
            }
        }

        return this;
    }

    assign(name, value) {
        if (_.isObject(value)) {
            _.assign(this.values, _.mapKeys(value, (_, key) => {
                return name + '.' + key;
            }));
        } else {
            this.values[name] = value;
        }
    }

    setMultiple(conf) {
        _.each(conf, (value, key) => {
            this.set(key, value);
        });

        return this;
    }

    /**
     * Builds a query object and checks for required parameters.
     *
     * @return {Object} KvP's of all provided parameters (used by invoke())
     */
    query() {
        return Promise.try(() => {
            const missing = checkParams(this.values, this.params, '');

            // Iterate through params and return list of any required and missing
            // Recurse on object-lists
            // prefix must be `''` or end with a `.`
            function checkParams(values, params, prefix) {
                return _.reduce(params, (missingParams, param) => {
                    const isList = param.list;
                    const isObject = param.type === Type.OBJECT;
                    const paramName = prefix + param.name + (isList ? '.1' : '');

                    if (isList && isObject) {
                        // recurse
                        return _.concat(missingParams, checkParams(values, param.params, paramName + '.'));
                    }

                    // check param
                    if (param.required && _.isNil(values[paramName])) {
                        return _.concat(missingParams, paramName);
                    }
                    return missingParams;
                }, []);
            }

            if (missing.length > 0) {
                throw new Error(`Missing required parameter${missing.length > 1 ? 's' : ''}: ${_.join(missing,', ')}!`);
            }

            return this.values;
        });
    }
}

module.exports = AmazonMwsRequest;
