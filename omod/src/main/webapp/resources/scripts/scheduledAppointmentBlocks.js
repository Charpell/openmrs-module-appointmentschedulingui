angular.module('appointmentscheduling.scheduledAppointmentBlocks', ['appointmentscheduling.appointmentService', 'locationService', 'ui.bootstrap', 'ngGrid'])
    .controller('ScheduledAppointmentBlockController', function ($scope, AppointmentService, LocationService) {



    $scope.filterDate = Date.now();
    $scope.datePicker = appointmentHelper.setupDatePicker($scope);

    var getLocations = function(){
        var locationSearchParams = {};
        if (supportsAppointmentsTagUuid) {
                locationSearchParams['tag'] = supportsAppointmentsTagUuid;
        };
        LocationService.getLocations(locationSearchParams).then(function (result){
            $scope.locations = result;
            setUpLocationFilter();
        });
    };


    $scope.locations = [];
    getLocations();

    var getProviders = function () {
        var providersWithAppointments = [];
        providersWithAppointments.push("All providers");
        angular.forEach($scope.scheduledAppointmentBlocks, function(block) {
            providersWithAppointments.push(block.provider);
        });
        $scope.providers = providersWithAppointments;
        $scope.providerFilter = $scope.providers[0];
    }

    var getServices = function () {
        var services = [];
        var servicesByBlock;
        services.push("All service types");
        angular.forEach($scope.scheduledAppointmentBlocks, function (scheduledAppointmentBlock) {
            servicesByBlock = scheduledAppointmentBlock.servicesWithAppointments();
            services = services.concat(servicesByBlock);
        });
        $scope.services = services;
    }


    $scope.providers = [];
    $scope.services = [];

    $scope.showNoScheduledAppointmentBlocks = false;
    $scope.showLoadingMessage = false;

    var setUpLocationFilter = function(){
            if( sessionLocationUuid){
                angular.forEach($scope.locations, function(location) {
                    if (location.uuid == sessionLocationUuid) {
                        $scope.locationFilter = location;
                    }
                });
            }
            else if( $scope.locations && $scope.locations.length > 0){
                $scope.locationFilter = $scope.locations[0];
            }
    };

    $scope.filterOptions = {
      filterText: ''
    };

    $scope.newSelectedProvider = function(provider){
        if(provider == 'All providers') $scope.filterOptions.filterText = '';
        else $scope.filterOptions.filterText = 'provider: ' + provider + ';';
    };

    $scope.newSelectedServiceType = function(serviceType){
        if(serviceType == 'All service types') $scope.filterOptions.filterText = '';
        else $scope.filterOptions.filterText = 'patient:' + serviceType;
    }

    $scope.pagingOptions = {
        pageSizes: [5],
        pageSize: 5,
        currentPage: 1
    };

    $scope.scheduledAppointmentBlocksGrid = appointmentHelper.setUpGrid($scope);
    $scope.scheduledAppointmentBlocks = [];
    $scope.totalScheduledAppointmentBlocks = [];
    $scope.totalServerItems = 0;
    $scope.updatePagingData = function() {
        appointmentHelper.setPagingData($scope);
    };

    $scope.getScheduledAppointmentBlocks = function(){
        var date = new Date($scope.filterDate);
        var location = $scope.locationFilter;
        var params = { 'date' : moment(date).format('YYYY-MM-DD'),
                       'location' : location.uuid};

        appointmentHelper.initializeMessages($scope);

        AppointmentService.getScheduledAppointmentBlocks(params).then( function(results){
            parsedScheduledAppointmentBlocks =  appointmentParser.parseScheduledAppointmentBlocks(results);
            $scope.scheduledAppointmentBlocks = parsedScheduledAppointmentBlocks;
            $scope.totalScheduledAppointmentBlocks = parsedScheduledAppointmentBlocks;
            getProviders();
            getServices();
            $scope.serviceFilter = $scope.services[0];
            appointmentHelper.manageMessages($scope);
            appointmentHelper.setPagingData($scope);
        });
    };

    $scope.$watch('pagingOptions', $scope.updatePagingData, true);
    $scope.$watch('filterDate', $scope.getScheduledAppointmentBlocks, true);
    $scope.$watch('locationFilter', function(newValue, oldValue) {
            if (newValue!= oldValue) {
                $scope.getScheduledAppointmentBlocks();
            }
    })

});