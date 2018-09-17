"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schema = exports.getMutatationObject = exports.defaultOptions = void 0;

var _graphqlSequelize = require("graphql-sequelize");

var _graphql = require("graphql");

var _underscore = require("underscore");

var _graphqlSubscriptions = require("graphql-subscriptions");

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var CLASSMETHODS = 'classMethods';
var ASSOCIATE = 'associate';
var modelTypes = [];
var modelNamesArray;
var models;
var authenticated;
/**
 * @property pubSub - needs to implement asyncIterator, and publish functions
 * @property
 */

var defaultOptions = {
  pubSub: {
    publish: function publish() {},
    asyncIterator: function asyncIterator() {}
  },
  authenticated: function authenticated(resolver) {
    return (
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(parent, args, context, info) {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", resolver(parent, args, context, info));

                case 1:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        return function (_x, _x2, _x3, _x4) {
          return _ref.apply(this, arguments);
        };
      }()
    );
  }
};
exports.defaultOptions = defaultOptions;

var getAssociations = function getAssociations(mod, depth) {
  var md = models[modelNamesArray.find(function (m) {
    return m === mod.name;
  })]; // console.log(Object.keys(models[mod.name].options[CLASSMETHODS][ASSOCIATE]))

  if (CLASSMETHODS in models[mod.name].options && ASSOCIATE in models[mod.name].options[CLASSMETHODS] && typeof models[mod.name].options.classMethods.getGraphQlAssociations == "function") {
    // console.log("we called it!")
    return models[mod.name].options.classMethods.getGraphQlAssociations(md, modelTypes, authenticated, _graphqlSequelize.resolver, _graphql.GraphQLList, getModelGraphQLType, models, depth);
  }

  return {};
};

var getModelGraphQLType = function getModelGraphQLType(md, depth, model_suffix) {
  depth = depth + 1;
  var found = modelTypes.find(function (t) {
    return t.name == md.name + model_suffix;
  });
  if (found) return found;
  var associations = {};

  if (depth < 12) {
    associations = getAssociations(md, depth);
  } // console.log(associations);


  var fields = _objectSpread({}, associations, (0, _graphqlSequelize.attributeFields)(md, {
    globalId: true
  }));

  var modType = new _graphql.GraphQLObjectType({
    name: md.name + (model_suffix ? model_suffix : ""),
    description: "Generated model for ".concat(md.name),
    //fields: _.assign(fields)
    fields: function fields() {
      return _objectSpread({}, getAssociations(md, depth), (0, _graphqlSequelize.attributeFields)(md, {
        globalId: true
      }));
    }
  }); // console.log("before: ", modelTypes.length)
  // modelTypes = found ? modelTypes.map( m => m.name == md.name ? modType : m) : [...modelTypes, modType];

  modelTypes = _toConsumableArray(modelTypes).concat([modType]); // console.log("after: ", modelTypes.length)

  return modType;
};

var getMutatationObject = function getMutatationObject(mod, options) {
  var _ref4;

  options = options ? options : defaultOptions;
  var inputArgs = (0, _graphqlSequelize.attributeFields)(mod);
  var updateArgs;

  var deleted = inputArgs["".concat(mod.name.toLowerCase(), "_id")],
      createArgs = _objectWithoutProperties(inputArgs, ["".concat(mod.name.toLowerCase(), "_id")]);

  var deleteArgs = (0, _graphqlSequelize.defaultListArgs)(mod); // make other fields not required on update

  Object.keys(inputArgs).map(function (k) {
    var kObj = inputArgs[k]; //console.log(`${mod.name}: ${k}: ${JSON.stringify(kObj.type)}`);

    if (kObj.type.toString().endsWith("!") && k.toLowerCase().includes("".concat(mod.name, "_id")) == false) {
      var obj_type = kObj.type.toString().toLowerCase();
      var type_to_assign; // console.log(obj_type);

      switch (obj_type) {
        case "int":
        case "int!":
          type_to_assign = _graphql.GraphQLInt;
          break;

        case "sequelizejson!":
        case "sequelizejson":
          type_to_assign = _graphqlSequelize.JSONType.default;
          break;

        case "float!":
        case "float":
          type_to_assign = _graphql.GraphQLFloat;
          break;

        case "bool":
        case "bool!":
        case "boolean":
        case "boolean!":
          type_to_assign = _graphql.GraphQLBoolean;
          break;

        case "string!":
        case "string":
        default:
          type_to_assign = _graphql.GraphQLString;
          break;
      }

      kObj.type = type_to_assign;
    }

    updateArgs = _objectSpread({}, updateArgs, _defineProperty({}, k, kObj));
  });
  return _ref4 = {}, _defineProperty(_ref4, "create".concat(titleCase(mod.name)), {
    type: modelTypes.find(function (modelT) {
      return modelT.name == mod.name;
    }),
    args: _underscore._.assign(createArgs),
    description: "Creates a new ".concat(mod.name),
    resolve: options.authenticated(
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(obj, args) {
        var ret;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (typeof mod.options.classMethods.preMutation === "function") args = mod.options.classMethods.preMutation(args);
                _context2.next = 3;
                return mod.create(args);

              case 3:
                ret = _context2.sent;
                if (typeof mod.options.classMethods.postMutation === "function") ret = (_readOnlyError("ret"), mod.options.classMethods.postMutation(ret));

                if (typeof options.pubsub.publish === "function") {
                  options.pubsub.publish("".concat(mod.name.toLowerCase(), "_changed"), _defineProperty({}, "".concat(mod.name.toLowerCase(), "_changed"), ret.dataValues));
                }

                return _context2.abrupt("return", new Promise(function (rsv, rej) {
                  return rsv(ret);
                }));

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function (_x5, _x6) {
        return _ref2.apply(this, arguments);
      };
    }())
  }), _defineProperty(_ref4, "update".concat(titleCase(mod.name)), {
    type: modelTypes.find(function (modelT) {
      return modelT.name == mod.name;
    }),
    args: _underscore._.assign(updateArgs),
    description: "Updates an existing ".concat(mod.name),
    resolve: options.authenticated(
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(obj, args) {
        var ret;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // return mod.save(args, {returning: true, validate: false});
                if (typeof mod.options.classMethods.preMutation === "function") args = mod.options.classMethods.preMutation(args);
                _context3.next = 3;
                return mod.update(args, {
                  where: _defineProperty({}, "".concat(mod.name.toLowerCase(), "_id"), args["".concat(mod.name.toLowerCase(), "_id")])
                });

              case 3:
                _context3.next = 5;
                return mod.findById(args["".concat(mod.name.toLowerCase(), "_id")]);

              case 5:
                ret = _context3.sent;
                // console.log(`${titleCase(mod.name)}_changed`, {[`${titleCase(mod.name)}_changed`]: ret.dataValues});
                if (typeof mod.options.classMethods.postMutation === "function") ret = (_readOnlyError("ret"), mod.options.classMethods.postMutation(args));

                if (typeof options.pubsub.publish === "function") {
                  options.pubsub.publish("".concat(mod.name.toLowerCase(), "_changed"), _defineProperty({}, "".concat(mod.name.toLowerCase(), "_changed"), ret.dataValues));
                } // console.log(ret);


                return _context3.abrupt("return", new Promise(function (rsv, rej) {
                  return rsv(ret);
                }));

              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function (_x7, _x8) {
        return _ref3.apply(this, arguments);
      };
    }())
  }), _defineProperty(_ref4, "delete".concat(titleCase(mod.name)), {
    type: modelTypes.find(function (modelT) {
      return modelT.name == mod.name;
    }),
    args: _underscore._.assign(deleteArgs),
    description: "Deletes an amount of ".concat(mod.name, "s"),
    resolve: options.authenticated(function (obj, args, context, info) {
      // console.log(JSON.stringify({...argsToFindOptions(args)}, null, '\t') );
      if (typeof mod.options.classMethods.preMutation === "function") args = mod.options.classMethods.preMutation(args);
      var where = Object.keys(args.where).reduce(function (prev, k, i) {
        var value = args.where[k]; // console.log(typeof value);

        return _objectSpread({}, prev, _defineProperty({}, k, typeof value == 'function' ? value(info.variableValues) : value));
      }, {}); // console.log(where);

      if (typeof options.pubsub.publish === "function") {
        options.pubsub.publish("".concat(mod.name.toLowerCase(), "_changed"), _defineProperty({}, "".concat(mod.name.toLowerCase(), "_changed"), obj));
      }

      if (typeof mod.options.classMethods.postMutation === "function") ret = mod.options.classMethods.postMutation(args);
      return mod.destroy({
        where: where
      });
    })
  }), _ref4;
};
/**
 *  
 * @param {Sequelize Model} mod 
 * @returns {Object}
 */


exports.getMutatationObject = getMutatationObject;

var getSubscriptionObject = function getSubscriptionObject(mod, options) {
  return _defineProperty({}, "".concat(mod.name.toLowerCase(), "_changed"), {
    type: modelTypes.find(function (modelT) {
      return modelT.name == mod.name;
    }),
    description: "Subscribes to ".concat(mod.name, " changes.  \n        The delete object will return an object that \n        represents the where clause used to delete."),
    subscribe: function subscribe() {
      return options.pubsub.asyncIterator("".concat(mod.name.toLowerCase(), "_changed"));
    }
  });
};

var getGenericSchemaObjectFromModel = function getGenericSchemaObjectFromModel(md, options, modelTypes) {
  var _modObj;

  // console.log(`schemaGenerators start, ${md.name}:`, JSON.stringify(Object.keys(md.sequelize.models.document.tableAttributes.shipto.references), null, '\t'))
  // console.log("", modelTypes);
  // const associations = {};
  //const inputArgs = attributeFields(md);
  var inputArgs = (0, _graphqlSequelize.defaultListArgs)(md);
  var found_type = modelTypes ? modelTypes.find(function (modelT) {
    return modelT.name == md.name + "_full";
  }) : undefined;
  found_type = found_type ? found_type : modelTypes.find(function (modelT) {
    return modelT.name == md.name;
  }); // console.log(JSON.stringify(found_type));

  var modObj = (_modObj = {}, _defineProperty(_modObj, md.name, {
    type: found_type,
    //getModelGraphQLType(md, associations),
    // args will automatically be mapped to `where`
    args: _defineProperty({}, md.primaryKeyAttribute, {
      description: "".concat(md.primaryKeyAttribute, " of the ").concat(md.name),
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt)
    }),
    resolve: options.authenticated((0, _graphqlSequelize.resolver)(md, {
      dataLoader: true
    }))
  }), _defineProperty(_modObj, "".concat(md.name, "s"), {
    type: new _graphql.GraphQLList(found_type),
    args: _objectSpread({}, inputArgs, {
      offset: {
        description: "Sets how many to skip when limiting ".concat(md.name, "s."),
        type: _graphql.GraphQLInt
      }
    }),
    resolve: options.authenticated((0, _graphqlSequelize.resolver)(md, {
      dataLoader: true
    }))
  }), _modObj);
  return modObj;
};

function titleCase(str) {
  return str.toLowerCase().split(' ').map(function (word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}
/**
 * @name schema
 * @description given sequelize object, a GraphQL schema will be returned
 * @param {Array<SequelizeModel>} models 
 * @param {Object} options 
 * @returns {GraphQLSchema}
 */


var schema = function schema(modeles, options) {
  models = modeles;
  authenticated = options.authenticated;
  modelNamesArray = Object.keys(models).filter(function (md) {
    return md.toLowerCase() != "sequelize";
  });
  modelNamesArray.map(function (modelName) {
    return getModelGraphQLType(models[modelName], 0);
  }
  /* console.log(modelName) */
  );
  return new _graphql.GraphQLSchema({
    query: new _graphql.GraphQLObjectType({
      name: 'RootQueryType',
      fields: _objectSpread({}, modelNamesArray.reduce(function (prev, mod, i) {
        if (modelNamesArray.length - 1 === i) {
          console.log("last one");
        }

        return _objectSpread({}, prev, getGenericSchemaObjectFromModel(models[mod], options, modelTypes));
      }, {}))
    }),
    mutation: new _graphql.GraphQLObjectType({
      name: 'RootMutationType',
      fields: _objectSpread({}, modelNamesArray.reduce(function (prev, mod, i) {
        return _objectSpread({}, prev, getMutatationObject(models[mod], options));
      }, {}))
    }),
    subscription: new _graphql.GraphQLObjectType({
      name: 'Subscription',
      fields: _objectSpread({}, modelNamesArray.reduce(function (prev, mod, i) {
        return _objectSpread({}, prev, getSubscriptionObject(models[mod], options));
      }, {}))
    })
  });
}; // module.exports = schema;


exports.schema = schema;