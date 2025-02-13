'use strict';

// Require the necessary things from Sequelize
const { Sequelize, Op, Model, DataTypes } = require('sequelize');

// This function should be used instead of `new Sequelize()`.
// It applies the config for your SSCCE to work on CI.
const createSequelizeInstance = require('./utils/create-sequelize-instance');

// This is an utility logger that should be preferred over `console.log()`.
const log = require('./utils/log');

// You can use sinon and chai assertions directly in your SSCCE if you want.
const sinon = require('sinon');
const { expect } = require('chai');

// Your SSCCE goes inside this function.
module.exports = async function() {
  const sequelize = createSequelizeInstance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      timestamps: false // For less clutter in the SSCCE
    }
  });

  // lib/sql-string.js formatNamedParameters gets the sql with `WHERE name = "some:foo"`
  // it will try to replace the ":foo", even tho it is not supposed to get replaced
  const query = {
    where: {
      name: 'some:foo', // this is a user provided string
    },
    replacements: {
      foo: ` or name = ' or ' = `,
    },
  };

  const Foo = sequelize.define('Foo', { name: DataTypes.TEXT });

  const spy = sinon.spy();
  sequelize.afterBulkSync(() => spy());
  await sequelize.sync();
  expect(spy).to.have.been.called;

  log(await Foo.create({ name: 'some:foo' }));
  log(await Foo.create({ name: 'foo1' }));
  log(await Foo.create({ name: 'foo2' }));
  expect(await Foo.findAll(query)).to.equal(1);
};
