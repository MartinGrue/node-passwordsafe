var should = require('should');
var PasswordSafe = require('..');
var fs = require('fs');
var psafe3Data = fs.readFileSync(__dirname + '/data/test_new.psafe3');

describe('Loading a database', function() {
    describe('without providing any credentials', function() {
        it('should trigger an error', function(done) {
            var safe = new PasswordSafe();
            safe.load(psafe3Data, function(err, databaseRecords) {
                should.exist(err);
                should.not.exist(databaseRecords);
                err.should.be.exactly('Wrong password provided.');
                done();
            });
        });
    });

    describe('with providing wrong credentials', function() {
        it('should trigger an error', function(done) {
            var safe = new PasswordSafe({
                password: 'invalidPassword',
            });
            safe.load(psafe3Data, function(err, databaseRecords) {
                should.exist(err);
                should.not.exist(databaseRecords);
                err.should.be.exactly('Wrong password provided.');
                done();
            });
        });
    });

    describe('empty input buffer', function() {
        it('should trigger an database format error', function(done) {
            var safe = new PasswordSafe();
            safe.load(new Buffer(0), function(err, databaseRecords) {
                should.exist(err);
                should.not.exist(databaseRecords);
                err.should.be.exactly('Invalid database format.');
                done();
            });
        });
    });

    // TODO
    // ====
    //
    // - Database with invalid header data
    // - Database with unsupported version
    // - Database with invalid record data
    // - ...
});

describe('Loading the test database', function() {
    it('should be successful with the password \'123456\'', function(done) {
        var safe = new PasswordSafe({
            password: '123456'
        });
        safe.load(psafe3Data, function(err, databaseRecords, headerRecord) {
            should.not.exist(err);
            should.exist(databaseRecords);
            should.exist(headerRecord);

            databaseRecords.should.be.instanceof(Array);
            databaseRecords.should.have.keys(
                'ba8bd21f-2ce9-41ad-b540-a5d8f9798a38',
                '15d7a4bd-77c6-48fa-bea2-d0b3aa46d6c6',
                '70b290a2-40a1-4454-afca-25b8859df609'
            );

            var record1 = databaseRecords['ba8bd21f-2ce9-41ad-b540-a5d8f9798a38'];
            (null === record1.getGroup()).should.be.true;
            record1.getTitle().should.be.exactly('title1');
            record1.getUsername().should.be.exactly('username1');
            record1.getPassword().should.be.exactly('password1');
            record1.getNotes().should.be.exactly('notes1');
            record1.getUrl().should.be.exactly('url1');
            record1.getEMailAddress().should.be.exactly('email1');
            record1.getCreationTime().getTime().should.be.exactly(
                new Date('Tue May 06 2014 00:52:25 GMT+0200 (CEST)').getTime()
            );
            // Clear record1
            record1 = null;

            var record2 = databaseRecords['15d7a4bd-77c6-48fa-bea2-d0b3aa46d6c6'];
            (null === record2.getGroup()).should.be.true;
            record2.getTitle().should.be.exactly('title2');
            record2.getUsername().should.be.exactly('username2');
            record2.getPassword().should.be.exactly('password2');
            record2.getNotes().should.be.exactly('notes2');
            record2.getUrl().should.be.exactly('url2');
            record2.getEMailAddress().should.be.exactly('email2');
            record2.getCreationTime().getTime().should.be.exactly(
                new Date('Tue May 06 2014 01:03:09 GMT+0200 (CEST)').getTime()
            );
            // Clear record2
            record2 = null;

            var record3 = databaseRecords['70b290a2-40a1-4454-afca-25b8859df609'];
            record3.getGroup().should.be.exactly('group');
            record3.getTitle().should.be.exactly('group.title1');
            record3.getUsername().should.be.exactly('group.username1');
            record3.getPassword().should.be.exactly('group.password1');
            record3.getUrl().should.be.exactly('group.url1');
            record3.getEMailAddress().should.be.exactly('group.email1');
            record3.getNotes().should.be.exactly('group.notes1');

            record3.getCreationTime().getTime().should.be.exactly(
                new Date('Tue May 06 2014 01:04:32 GMT+0200 (CEST)').getTime()
            );

            headerRecord.getUUID().should.be.exactly('aedb9da0-2cc7-478a-b14d-1d226cdaec19');
            done();
        });
    });
});

describe('Loading a database with a wrong hmac integrity data', function() {
    it('should raise an integrity check error', function(done) {
        var safe = new PasswordSafe({
            password: '123456'
        });
        safe.load(fs.readFileSync(__dirname + '/data/integrity_check_fails.psafe3'), function(err, databaseRecords) {
            should.exist(err);
            should.not.exist(databaseRecords);
            err.should.be.exactly('Database integrity check (HMAC) went wrong.');
            done();
        });
    });
});
