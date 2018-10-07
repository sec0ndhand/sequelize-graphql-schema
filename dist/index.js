"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schema = exports.getMutatationObject = exports.defaultOptions = void 0;

require("core-js/modules/es6.promise");

var _graphqlSequelize = require("graphql-sequelize");

var _graphql = require("graphql");

var _underscore = require("underscore");

var _graphqlSubscriptions = require("graphql-subscriptions");

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const CLASSMETHODS = 'classMethods';
const ASSOCIATE = 'associate';
let modelTypes = [];
let modelNamesArray;
let models;
let authenticated;
/**
 * @property pubSub - needs to implement asyncIterator, and publish functions
 * @property
 */

const defaultOptions = {
  pubSub: {
    publish: () => {},
    asyncIterator: () => {}
  },
  authenticated: resolver =>
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(function* (parent, args, context, info) {
      return resolver(parent, args, context, info);
    });

    return function (_x, _x2, _x3, _x4) {
      return _ref.apply(this, arguments);
    };
  }()
};
exports.defaultOptions = defaultOptions;

const getAssociations = (mod, depth) => {
  const md = models[modelNamesArray.find(m => m === mod.name)]; // console.log(Object.keys(models[mod.name].options[CLASSMETHODS][ASSOCIATE]))

  if (CLASSMETHODS in models[mod.name].options && ASSOCIATE in models[mod.name].options[CLASSMETHODS] && typeof models[mod.name].options.classMethods.getGraphQlAssociations == "function") {
    // console.log("we called it!")
    return models[mod.name].options.classMethods.getGraphQlAssociations(md, modelTypes, authenticated, _graphqlSequelize.resolver, _graphql.GraphQLList, getModelGraphQLType, models, depth);
  }

  return {};
};

const getModelGraphQLType = (md, depth, model_suffix) => {
  depth = depth + 1;
  let found = modelTypes.find(t => t.name == md.name + model_suffix);
  if (found) return found;
  let associations = {};

  if (depth < 12) {
    associations = getAssociations(md, depth);
  } // console.log(associations);


  const fields = _objectSpread({}, associations, (0, _graphqlSequelize.attributeFields)(md, {
    globalId: true
  }));

  const modType = new _graphql.GraphQLObjectType({
    name: md.name + (model_suffix ? model_suffix : ""),
    description: `Generated model for ${md.name}`,
    //fields: _.assign(fields)
    fields: () => _objectSpread({}, getAssociations(md, depth), (0, _graphqlSequelize.attributeFields)(md, {
      globalId: true
    }))
  }); // console.log("before: ", modelTypes.length)
  // modelTypes = found ? modelTypes.map( m => m.name == md.name ? modType : m) : [...modelTypes, modType];

  modelTypes = [...modelTypes, modType]; // console.log("after: ", modelTypes.length)

  return modType;
};

const getMutatationObject = (mod, options) => {
  options = options ? options : defaultOptions;
  const inputArgs = (0, _graphqlSequelize.attributeFields)(mod);
  let updateArgs;

  const deleted = inputArgs[`${mod.name.toLowerCase()}_id`],
        createArgs = _objectWithoutProperties(inputArgs, [`${mod.name.toLowerCase()}_id`]);

  const deleteArgs = (0, _graphqlSequelize.defaultListArgs)(mod); // make other fields not required on update

  Object.keys(inputArgs).map(k => {
    let kObj = inputArgs[k]; //console.log(`${mod.name}: ${k}: ${JSON.stringify(kObj.type)}`);

    if (kObj.type.toString().endsWith("!") && k.toLowerCase().includes(`${mod.name}_id`) == false) {
      let obj_type = kObj.type.toString().toLowerCase();
      let type_to_assign; // console.log(obj_type);

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

    updateArgs = _objectSpread({}, updateArgs, {
      [k]: kObj
    });
  });
  let preMutationDefined = mod && mod.options && mod.options.classMethods && typeof mod.options.classMethods.preMutation === "function";
  let postMutationDefined = mod && mod.options && mod.options.classMethods && typeof mod.options.classMethods.postMutation === "function";
  let pubSubIsDefined = options && options.pubsub && options.pubsub.publish && typeof options.pubsub.publish === "function";
  return {
    [`create${titleCase(mod.name)}`]: {
      type: modelTypes.find(modelT => modelT.name == mod.name),
      args: _underscore._.assign(createArgs),
      description: `Creates a new ${mod.name}`,
      resolve: options.authenticated(
      /*#__PURE__*/
      function () {
        var _ref2 = _asyncToGenerator(function* (obj, args) {
          if (preMutationDefined) args = mod.options.classMethods.preMutation(args, models);
          const ret = yield mod.create(args);
          if (postMutationDefined) ret = mod.options.classMethods.postMutation(ret, models);

          if (pubSubIsDefined) {
            options.pubsub.publish(`${mod.name.toLowerCase()}_changed`, {
              [`${mod.name.toLowerCase()}_changed`]: ret.dataValues
            });
          }

          return new Promise((rsv, rej) => rsv(ret));
        });

        return function (_x5, _x6) {
          return _ref2.apply(this, arguments);
        };
      }())
    },
    [`update${titleCase(mod.name)}`]: {
      type: modelTypes.find(modelT => modelT.name == mod.name),
      args: _underscore._.assign(updateArgs),
      description: `Updates an existing ${mod.name}`,
      resolve: options.authenticated(
      /*#__PURE__*/
      function () {
        var _ref3 = _asyncToGenerator(function* (obj, args) {
          // return mod.save(args, {returning: true, validate: false});
          var tmpArgs;
          if (preMutationDefined) tmpArgs = mod.options.classMethods.preMutation(args, models);
          yield mod.update(tmpArgs, {
            where: {
              [`${mod.name.toLowerCase()}_id`]: args[`${mod.name.toLowerCase()}_id`]
            }
          });
          const ret = yield mod.findById(args[`${mod.name.toLowerCase()}_id`]); // console.log(`${titleCase(mod.name)}_changed`, {[`${titleCase(mod.name)}_changed`]: ret.dataValues});

          if (postMutationDefined) ret = mod.options.classMethods.postMutation(args, models);

          if (pubSubIsDefined) {
            options.pubsub.publish(`${mod.name.toLowerCase()}_changed`, {
              [`${mod.name.toLowerCase()}_changed`]: ret.dataValues
            });
          } // console.log(ret);


          return new Promise((rsv, rej) => rsv(ret));
        });

        return function (_x7, _x8) {
          return _ref3.apply(this, arguments);
        };
      }())
    },
    [`delete${titleCase(mod.name)}`]: {
      type: modelTypes.find(modelT => modelT.name == mod.name),
      args: _underscore._.assign(deleteArgs),
      description: `Deletes an amount of ${mod.name}s`,
      resolve: options.authenticated((obj, args, context, info) => {
        // console.log(JSON.stringify({...argsToFindOptions(args)}, null, '\t') );
        var tmpArgs;
        if (preMutationDefined) tmpArgs = mod.options.classMethods.preMutation(args, models);
        let where = Object.keys(tmpArgs.where).reduce((prev, k, i) => {
          let value = tmpArgs.where[k]; // console.log(typeof value);

          return _objectSpread({}, prev, {
            [k]: typeof value == 'function' ? value(info.variableValues) : value
          });
        }, {}); // console.log(where);

        if (pubSubIsDefined) {
          options.pubsub.publish(`${mod.name.toLowerCase()}_changed`, {
            [`${mod.name.toLowerCase()}_changed`]: obj
          });
        }

        if (postMutationDefined) ret = mod.options.classMethods.postMutation(tmpArgs, models);
        return mod.destroy({
          where
        });
      })
    }
  };
};
/**
 *  
 * @param {Sequelize Model} mod 
 * @returns {Object}
 */


exports.getMutatationObject = getMutatationObject;

const getSubscriptionObject = (mod, options) => {
  let pubSubIsDefined = options && options.pubsub && options.pubsub.publish && typeof options.pubsub.publish === "function";
  const defaultArgs = (0, _graphqlSequelize.defaultListArgs)(mod);
  return {
    [`${mod.name.toLowerCase()}_changed`]: {
      type: modelTypes.find(modelT => modelT.name == mod.name),
      args: defaultArgs,
      description: `Subscribes to ${mod.name} changes.  The delete object will return an object that represents the where clause used to delete.`,
      subscribe: (0, _graphqlSubscriptions.withFilter)(() => {
        if (pubSubIsDefined) {
          return options.pubsub.asyncIterator(`${mod.name.toLowerCase()}_changed`);
        } else return {};
      }, (payload, variables, more, more2) => {
        // if no where clause is provided, send what is already there
        if (!variables["where"]) return true;
        const rtn = whereMatch(payload[`${mod.name.toLowerCase()}_changed`], variables["where"]);
        return rtn ? true : false;
      })
    }
  };
};

const whereMatch = (obj, where) => {
  const keys = Object.keys(where);
  let subRtn = true;
  const rtn = keys.length > 0 ? keys.reduce((prev, key, i) => {
    if (typeof where[key] === "object") {
      // console.log("call it again.", key)
      subRtn = whereMatch(obj[key], where[key]);
    } // console.log("obj[key] === where[key]", typeof obj[key] === "object", key, obj[key], where[key].toString(), obj[key] === where[key]);


    return prev && subRtn && (typeof obj[key] === "object" ? true : obj[key] === where[key]);
  }, true) : true; // console.log("rtn, obj[key], obj, where: ",
  //           rtn ? true : false,
  //           obj[keys[0]],
  //           obj,
  //           where
  //         );

  return rtn ? true : false;
}; // const getSubscriptionObject = (mod, options) => {
//   return {
//       [`${mod.name.toLowerCase()}_changed`]: {
//         type: modelTypes.find(modelT => modelT.name == mod.name),
//         description: `Subscribes to ${mod.name} changes.  
//         The delete object will return an object that 
//         represents the where clause used to delete.`,
//         subscribe: () => options.pubsub.asyncIterator(`${mod.name.toLowerCase()}_changed`)        
//       }
//   };
// }


const getGenericSchemaObjectFromModel = (md, options, modelTypes) => {
  // console.log(`schemaGenerators start, ${md.name}:`, JSON.stringify(Object.keys(md.sequelize.models.document.tableAttributes.shipto.references), null, '\t'))
  // console.log("", modelTypes);
  // const associations = {};
  //const inputArgs = attributeFields(md);
  const inputArgs = (0, _graphqlSequelize.defaultListArgs)(md);
  let found_type = modelTypes ? modelTypes.find(modelT => modelT.name == md.name + "_full") : undefined;
  found_type = found_type ? found_type : modelTypes.find(modelT => modelT.name == md.name); // console.log(JSON.stringify(found_type));

  const modObj = {
    [md.name]: {
      type: found_type,
      //getModelGraphQLType(md, associations),
      // args will automatically be mapped to `where`
      args: {
        [md.primaryKeyAttribute]: {
          description: `${md.primaryKeyAttribute} of the ${md.name}`,
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt)
        }
      },
      resolve: options.authenticated((0, _graphqlSequelize.resolver)(md, {
        dataLoader: true
      }))
    },
    [`${md.name}s`]: {
      type: new _graphql.GraphQLList(found_type),
      args: _objectSpread({}, inputArgs, {
        offset: {
          description: `Sets how many to skip when limiting ${md.name}s.`,
          type: _graphql.GraphQLInt
        }
      }),
      resolve: options.authenticated((0, _graphqlSequelize.resolver)(md, {
        dataLoader: true
      }))
    }
  };
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


const schema = function schema(modeles, options) {
  models = modeles;
  authenticated = options.authenticated;
  modelNamesArray = Object.keys(models).filter(md => md.toLowerCase() != "sequelize");
  modelNamesArray.map(modelName => getModelGraphQLType(models[modelName], 0)
  /* console.log(modelName) */
  );
  return new _graphql.GraphQLSchema({
    query: new _graphql.GraphQLObjectType({
      name: 'RootQueryType',
      fields: _objectSpread({}, modelNamesArray.reduce((prev, mod, i) => {
        if (modelNamesArray.length - 1 === i) {
          console.log("last one");
        }

        return _objectSpread({}, prev, getGenericSchemaObjectFromModel(models[mod], options, modelTypes));
      }, {}))
    }),
    mutation: new _graphql.GraphQLObjectType({
      name: 'RootMutationType',
      fields: _objectSpread({}, modelNamesArray.reduce((prev, mod, i) => {
        return _objectSpread({}, prev, getMutatationObject(models[mod], options));
      }, {}))
    }),
    subscription: new _graphql.GraphQLObjectType({
      name: 'Subscription',
      fields: _objectSpread({}, modelNamesArray.reduce((prev, mod, i) => {
        return _objectSpread({}, prev, getSubscriptionObject(models[mod], options));
      }, {}))
    })
  });
}; // module.exports = schema;


exports.schema = schema;