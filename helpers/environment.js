const environments = {};
environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'hakdfksdjsd',
    maxChecks: 5,
    twillo: {
        fromPhon: '+18454421824',
        accountSid: 'ACac813866d22381f07eb8dc2302fd6781',
        authToken: '0fe8f003002b75592ef2e9d3607d56b3',
    },
};
environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'hakdfksdjsd',
    maxChecks: 5,
    twillo: {
        fromPhon: '+18454421824',
        accountSid: 'ACac813866d22381f07eb8dc2302fd6781',
        authToken: '0fe8f003002b75592ef2e9d3607d56b3',
    },
};

const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';
const environmentsToExports =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;

module.exports = environmentsToExports;
