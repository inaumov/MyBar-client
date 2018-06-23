angular.module('application.runner', ['myBar.config']).config(['$compileProvider', 'GENERAL_CONFIG', ApplicationRunner]);

function ApplicationRunner($compileProvider, GENERAL_CONFIG) {
    // disable debug info when false, otherwise skip
    if (GENERAL_CONFIG.debugInfoEnabled === false) {
        $compileProvider.debugInfoEnabled(false);
    }

}
