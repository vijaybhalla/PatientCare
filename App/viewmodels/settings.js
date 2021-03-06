/***************************************************************************************************
 * ViewModel: Settings
 * Author(s): Sean Malone
 * Description: This VM handles the business logic for the Settings page.
 **************************************************************************************************/
define(function(require) { 
	/*********************************************************************************************** 
	 * Includes
	 **********************************************************************************************/
	var system 		= require('durandal/system');			// System logger
	var custom 	 	= require('durandal/customBindings');	// Custom bindings
	var Structures 	= require('modules/structures');		// Structures
	var Forms		= require('modules/form');				// Common Form elements
	var Backend     = require('modules/settings');			// Backend
	var app			= require('durandal/app');				// App
	var UserStructures = require('modules/structures');		// User structures
	
	/*********************************************************************************************** 
	 * KO Observables
	 **********************************************************************************************/
	var self;
	var structures 		= new Structures();
	var userStructures 	= new UserStructures();
	var backend    		= new Backend();
	var form			= new Forms();
	var user 			= ko.observable(new userStructures.User());
	var userRole 		= ko.observable(new userStructures.Role());
	var userId  		= ko.observable();
	var practiceId 		= ko.observable();
	var practice		= ko.observable(new structures.Practice());
	var newFlag	 		= ko.observable(false);
	var newRoleFlag 	= ko.observable(false);
	var currentUser 	= ko.observable();
	var users   		= ko.observableArray([]);
	var user			= ko.observable(new structures.User());
	var tempUser		= ko.observable();
	var role			= ko.observable(new structures.Role());
	var roles			= ko.observableArray([]);
	var tempRole		= ko.observable();

	/*********************************************************************************************** 
	 * KO Computed Functions
	 **********************************************************************************************/
	 var getRoleName = function(data) {
		var name = _.find(roles(), function(item) { return item.id() == data.roleId() });
		return name.name();
	}

	/*********************************************************************************************** 
	 * ViewModel
	 *
	 * For including ko observables and computed functions, add an attribute of the same name.
	 * Ex: observable: observable
	 **********************************************************************************************/
	return {
		/******************************************************************************************* 
		 * Attributes
		 *******************************************************************************************/
		form: form,
		user: user,
		userRole: userRole,
		userId: userId,
		practiceId: practiceId,
		practice: practice,
		newFlag: newFlag,
		newRoleFlag: newRoleFlag,
		user: user,
		users: users,
		tempUser: tempUser,
		role: role,
		roles: roles,
		currentUser: currentUser,
		tempRole: tempRole,
		/******************************************************************************************* 
		 * Methods
		 *******************************************************************************************/
		// This allow manipulation of the DOM
		viewAttached: function() {
			// Change the selected nav item 
			$('.navItem').removeClass('active');
			$('.settingsNav').addClass('active');
			
			// True fit
			var height = parseInt($('.viewHolder').height()) - 12;
			$('.settingsContent > .tab-pane').height(height);
			$('.settingsPills').height(height);
			$('.subSettings .tab-pane').height(height - 50);
			$('.userTableHolder').height(parseInt($('.tab-pane').height()) - 362);
			$('.roleContent').height(parseInt($('.tab-pane').height()) - 200);
			$(window).resize(function() {
				var height = parseInt($('.viewHolder').height()) - 12;
				$('.settingsContent > .tab-pane').height(height);
				$('.settingsPills').height(height);
				$('.subSettings .tab-pane').height(height - 50);
				$('.userTableHolder').height(parseInt($('.tab-pane').height()) - 362);
				$('.roleContent').height(parseInt($('.tab-pane').height()) - 200);
			});
			
			// Change class for active role
			$('.rolesList a').click(function(e) { 
				e.preventDefault();
				 $('.rolesList li').removeClass('active');
				 $(this).parent().addClass('active');
			});
			
			// Password popover
			$('.control-label i').popover({
				title: 'Password',
				html: true,
				content: '<p>This will reset the user\'s password.</p>' +
						 '<p style="color: red; font-weight: bold;">Use with caution!</p>', 
				placement: 'bottom',
				trigger: 'hover'
			});
		},
		// Loads when view is loaded
		activate: function(data) {
			self = this;
			
			// Get Role
			backend.getRole(global.userId, global.practiceId).success(function(data) {
				self.userRole(new userStructures.Role(data[0]));
			});
			
			self.userId(global.userId);
			self.practiceId(global.practiceId);
			
			// Get Practice Information
			backend.getPractice(self.practiceId()).success(function(data) {
				self.practice(new userStructures.Practice(data[0]));
			});
			
			// Get currentUser
			backend.getCurrentUser(self.userId()).success(function(data) {
				self.currentUser(new structures.User(data));
			});
			
			// Get users
			backend.getUsers(self.practiceId()).success(function(data) {
				var u = $.map(data, function(item) { return new structures.User(item) });
				self.users(u);
				if(u.length > 0)
					self.user(u[0]);
			});
			
			// Get Roles
			backend.getRoles(self.practiceId()).success(function(data) {
				var r = $.map(data, function(item) { return new structures.Role(item) });
				self.roles(r);
				if(r.length > 0)
					self.role(r[0]);
			});
		},
		/****************************************************************************************** 
		 * Practice
		 *****************************************************************************************/
		// Save Practice
		savePractice: function() {
			backend.savePractice(self.practice()).complete(function(data) {
				if(data.responseText.toLowerCase().indexOf('success') >= 0)
					$('.alert-success').fadeIn().delay(3000).fadeOut();
			});
		},
		/****************************************************************************************** 
		 * User
		 *****************************************************************************************/
		// New User
		newUser: function() {
			self.tempUser(self.user());
			self.user(new structures.User());
			self.newFlag(true);
		},
		// Cancel User
		cancelUser: function() {
			self.user(self.tempUser());
			self.newFlag(false);
		},
		// Save User
		saveUser: function() {
			self.user().practiceId(self.practiceId());
			/**********************************************************************************
			 * Check for duplicate username
		 	 *********************************************************************************/
			var name = self.user().username();
			var match = _.find(self.users(), function(item) { return item.username() == name});
			if(match == undefined || self.user().id() != undefined) {
				/**********************************************************************************
				 * Check for errors
				 *********************************************************************************/
				if(self.user().errors().length > 0) {
					if(self.user().errors().length > 1)
						$('.allAlert').fadeIn().delay(3000).fadeOut();
					else if(self.user().errors()[0] == 'user')
						$('.userAlert').fadeIn().delay(3000).fadeOut();
					else if(self.user().errors()[0] == 'email' && self.user().email() != undefined)
						$('.emailInvalidAlert').fadeIn().delay(5000).fadeOut();
					else if(self.user().errors()[0] == 'email')
						$('.emailAlert').fadeIn().delay(3000).fadeOut();
				}
				else {
					/******************************************************************************
				 	 * Save User
				 	 *****************************************************************************/
					backend.saveUser(self.user()).complete(function(data) {
						var response = $.parseJSON(data.responseText);
						if(response.result.toLowerCase().indexOf('success') >= 0) {
							// Insert
							if(response.result.toLowerCase().indexOf('insert') >= 0) {
								// Update new users fields
								self.user().id(response.id);
								// Add user to table
								self.users.push(self.user());
								
								$.get('php/emailPass.php', {user: JSON.stringify(ko.toJS(self.user())), method: 'new'});
							}
							
							// Success message
							$('.alert-success').fadeIn().delay(3000).fadeOut();
							self.newFlag(false);
						}
					});
				}
			}
			else
				$('.userTakenAlert').fadeIn().delay(3000).fadeOut();
		},
		// Delete User
		deleteUser: function(data) {
			app.showMessage('Are you sure you want to delete ' + self.user().firstName() 
							+ ' ' + self.user().lastName() + '?',
						    'Delete User', ['Yes', 'No']).done(function(result) {
				if(result == 'Yes') {
					backend.deleteUser(data.id(), self.practiceId()).complete(function(data) {
						if(data.responseText == 'deleteSuccess') {
							self.users.remove(self.user());
							self.user(self.users()[0]);
						}
					});
				}
			});
		},
		// Select User
		selectUser: function(data) {
			self.user(data);
		},
		/****************************************************************************************** 
		 * Role
		 *****************************************************************************************/
		// Select Role
		selectRole: function(data) {
			 self.role(data);
		},
		// Toggle Child element
		toggleChild: function(data, event) {
			var e = $(event.currentTarget);
			e.toggleClass('icon-plus').toggleClass('icon-minus');
			e.parent().parent().parent().find('> .child').slideToggle();
		},
		// New Role
		newRole: function(data) {
			self.tempRole(self.role());
			self.role(new structures.Role());
			self.newRoleFlag(true);
		},
		// Cancel Role
		cancelRole: function(data) {
			self.role(self.tempRole());
			self.newRoleFlag(false);
		},
		// Save Role
		saveRole: function(data) {
			// Check for duplicate role names
			var name = self.role().name();
			var match = _.find(self.roles(), function(item) { return item.name() == name});
			// If is new and no duplicate name
			if(match == undefined || self.role().id() != undefined) {
				// Add practice id
				self.role().practiceId(self.practiceId());
				// Don't save if administrator
				if(self.role().name() != 'Administrator') {
					// Save role
					backend.saveRole(self.role()).complete(function(d) {
						// Insert successful
						if(d.responseText.indexOf('id') >= 0) {
							self.roles.push(self.role());
							self.newRoleFlag(false);
						}
						
						// Successful	
						if(d.responseText.toLowerCase().indexOf('fail') < 0) 
							$('.alert-success').fadeIn().delay(3000).fadeOut();
					});
				}
			}
			// Duplicate name
			else
				$('.nameAlert').fadeIn().delay(3000).fadeOut();
		},
		// Delete Role
		deleteRole: function() {
			app.showMessage('Are you sure you want to delete ' + self.role().name() + '?',
						    'Delete Role', ['Yes', 'No']).done(function(result) {
				if(result == 'Yes') {
					backend.deleteRole(self.role().id(), self.practiceId());
					self.roles.remove(self.role());
					self.role(new structures.Role());
				}						 	
			});
		},
		// Reset Password
		resetPassword: function() {
			// Email
			app.showMessage(
				'Are you sure you want to reset ' + user().firstName() + " " + user().lastName() + "'s password?", 
				'Rest Password', 
				['Yes', 'No']
			).then(function(response) {
				if(response == 'Yes')
					$.get('php/emailPass.php', {user: JSON.stringify(ko.toJS(self.user())), method: 'reset'});
			});
		},
		// Get Role name (computed)
		getRoleName: getRoleName
	};
});