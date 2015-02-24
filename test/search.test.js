'use strict';

/**
 * Module dependencies.
 */

var simpleHttp = require('../lib/simple-http');
var imdbApi = require('../index');
var sinon = require('sinon');

var _shouldHaveErrorMessage = function(params, message, done) {
	imdbApi.search(params, function(err) {
		err.should.eql(message);
		done();
	});
};

var _shouldBeCalledWithUrl = function(params, expectedUrl, done) {
	imdbApi.search(params, function() {
		simpleHttp.get
		.calledWith(expectedUrl)
		.should.equal(true);
		done();
	});
};

describe('Search Film', function() {

	beforeEach(function() {
		sinon.stub(simpleHttp, 'get');
		simpleHttp.get.yields(null, { title: 'film title' });
	});

	afterEach(function() {
		simpleHttp.get.restore();
	});

	it('with http error returns error message', function(done) {

    var url = 'http://www.omdbapi.com/?s=Terminator&r=json';
    var params = {
      query: 'Terminator'
    };

    simpleHttp.get.withArgs(url).yields('timeout error', null);

    _shouldHaveErrorMessage(
      params,
      'timeout error',
      done);
  });

  it('with imdb error returns error message', function(done) {

    var url = 'http://www.omdbapi.com/?s=Alcatraz&r=json';
    
    var response = { 
      Error: 'message from imdb server' 
    };

    var params = {
      query: 'Alcatraz'
    };

    simpleHttp.get.withArgs(url).yields(null, response);

    _shouldHaveErrorMessage(
      params,
      'message from imdb server',
      done);
  });

  it('with imdb data returns response data', function(done) {

    var url = 'http://www.omdbapi.com/?s=The%20Brain%20Terminator&r=json';
    
    var response = { 
      Title: 'The Brain Terminator',
      Year: '2012'
    };

    var params = {
      query: 'The Brain Terminator'
    };

    simpleHttp.get.withArgs(url).yields(null, response);

    imdbApi.search(params, function(err, data) {
      data.should.eql(response);
      done();
    });
  });

	describe('with invalid mandatory params', function() {

		it('returns error when params object is null', function(done) {
			_shouldHaveErrorMessage(
				null, 
				'params cannot be null.', 
				done);
		});

		it('returns error when query is empty', function(done) {
			_shouldHaveErrorMessage(
				{}, 
				'query param required.', 
				done);
		});

	});

	describe('with "query" parameter', function() {

		it('returns error for invalid string', function(done) {
			var params = {
				query: 50
			};

			_shouldHaveErrorMessage(params, 'query must be a string.', done);
		});

		it('calls omdbapi with query querystring param', function(done) {
			var params = {
				query: 'Terminator'
			};

			_shouldBeCalledWithUrl(
				params,
				'http://www.omdbapi.com/?s=Terminator&r=json',
				done);
		});

	});

	describe('with "type" parameter', function() {

		it('returns error for invalid type', function(done) {
			var params = {
				query: 'Terminator',
				type: 'film'
			};

			_shouldHaveErrorMessage(
				params,
				'type must be: movie, series, episode.', 
				done);
		});

		it('calls omdbapi with type querystring param', function(done) {
			var params = {
				query: 'Terminator',
				type: 'movie'
			};

			_shouldBeCalledWithUrl(
				params,
				'http://www.omdbapi.com/?s=Terminator&type=movie&r=json',
				done);
		});

	});

	describe('with "year" parameter', function() {
		
		it('returns error when type is not number', function(done) {
			var params = {
				query: 'Terminator',
				year: 'yesterday'
			};

			_shouldHaveErrorMessage(
				params, 
				'year must be a valid number', 
				done);
		});

		it('calls omdbapi with year querystring param', function(done) {
			var params = {
				query: 'Terminator',
				year: 1984
			};

			_shouldBeCalledWithUrl(
				params,
				'http://www.omdbapi.com/' +
					'?s=Terminator&y=1984&r=json',
				done);
		});

	});

});