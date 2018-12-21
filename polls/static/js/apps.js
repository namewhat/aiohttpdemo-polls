'use static';
var login_app = angular.module('login', []);
// app列表
var list_app = [login_app];
// 实例化配置
var config = new Config(list_app);

login_app.controller('signin-form', function($scope, $http) {
	$scope.$watch('{u:username, p:password, v:verify}', function(nv, ov) {
		if (nv == ov)  return;
		// 切换“登录”按钮背景色
		if (nv.u && nv.p && nv.v) {
			document.getElementById('signin').style.background = 'blue';
		} else {
			document.getElementById('signin').style.background = '';
		}
		if (nv.v != ov.v) {
			$http.get('/api/update/verify');
		}
	}, true);

	$scope.signinClick = () => {
		if ($scope.username && $scope.password && $scope.verify) {
			var data = {
				'username': $scope.username,
				'password': $scope.password,
				'keepup': $scope.keepup
			}
			$http.post('/login', data).then(function successCallback() {
				// body...
				}, function errorCallback() {
					// body...
				})
		} else {
			return;
		}
	};
});

login_app.controller('signup-form', function($scope) {
	// pas
});
