var execSync = require('child_process').execSync,
    expect = require('chai').expect;

describe('The grunt task', function() {
    it('should fail', function() {
        expect(function() {
            execSync('grunt symdiff');
        }).to.throw;
    });
});