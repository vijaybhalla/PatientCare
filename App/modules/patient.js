/**************************************************************************************************
 * Module name: Patient
 * Viewmodel: App/viewmodels/managepatients.js
 * Author(s): Gary Chang, Imran Esmail, Sean Malone
 * Description: This module is used to query the database for patient.
 *************************************************************************************************/
define(function(require) {
	/*********************************************************************************************** 
	 * Includes
	 **********************************************************************************************/
	var system = require('durandal/system');			// System logger
	
	/**********************************************************************************************
	 * Constructor
	 *********************************************************************************************/
	var patient = function() {}
	
	/**********************************************************************************************
	 * Get Methods
	 * 
	 * These methods retrieve information from the database via SELECT queries
	 *********************************************************************************************/
	// Role
	patient.prototype.getRole = function(id, practiceId) {
		return this.query({
			mode: 'select', 
			table: 'user', 
			fields: '*',
			join: "JOIN role ON user.role_id=role.id",
			where: "WHERE user.id='" + id +"' AND user.practice_id='" + practiceId + "'"
		});
	}
	
	// Get All Patients
	patient.prototype.getPatients = function(id) {
		return this.query({
			mode: 'select', 
			table: 'patient', 
			fields: '*',
			where: "WHERE practice_id='" + id + "'"
		});
	}
	
	// Get Personal Information for a Single Patient
	patient.prototype.getPatient = function(id, practiceId) {
		if(id == 'new')
			id = -1;
		return this.query({
			mode: 'select', 
			table: 'patient', 
			fields: '*', 
			where: "WHERE id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Get All Insurances for a Single Patient
	patient.prototype.getInsurance = function(id, practiceId) {
		return this.query({
			mode: 'select', 
			table: 'insurance', 
			fields: '*', 
			where: "WHERE patient_id='" + id + "' AND practice_id='" + practiceId + "'" 
		});
	}
	
	// Get Guarantor for a Single Patient
	patient.prototype.getGuarantor = function(id, practiceId) {
		return this.query({
			mode: 'select', 
			table: 'guarantor', 
			fields: '*', 
			where: "WHERE patient_id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Get Employer for a Single Patient
	patient.prototype.getEmployer = function(id, practiceId) {
		return this.query({
			mode: 'select', 
			table: 'employer', 
			fields: '*', 
			where: "WHERE patient_id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Get Spouse for a Single Patient
	patient.prototype.getSpouse = function(id, practiceId) {
		return this.query({
			mode: 'select', 
			table: 'spouse', 
			fields: '*', 
			where: "WHERE patient_id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Get Reference for a Single Patient
	patient.prototype.getReference = function(id, practiceId) {
		return this.query({
			mode: 'select',
			table: 'reference',
			fields: '*',
			where: "WHERE patient_id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Get Service Records for a Single Patient
	patient.prototype.getServiceRecords = function(id, practiceId) {
		if(id == 'new')
			id = -1;
		var self = this;
		var fields = ['service_record.id', 'service_record.patient_id', 'service_record.physician_id',
			'physician.first_name', 'physician.last_name', 'service_record.date', 'service_record.reason',
			'service_record.history', 'service_record.systems_comment', 'service_record.no_known_allergies',
			'service_record.allergies_verified', 'service_record.physical_examination_comment',
			'service_record.plan_and_instructions']; 
		
		return self.query({
			mode: 'select',
			table: 'service_record',
			join: "LEFT JOIN physician ON service_record.physician_id=physician.id",
			fields: fields,
			where: "WHERE service_record.patient_id='" + id + "' AND service_record.practice_id='" + practiceId + "'"
		});
	}
	
	// Get Service Record for a Single Patient
	patient.prototype.getServiceRecord = function(id, practiceId, date) {
		if(id == 'new')
			id = -1;
		return this.query({
			mode: 'select',
			table: 'service_record',
			fields: '*',
			where: "WHERE patient_id='" + id + "' AND date='" + date + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Get All Physicians
	patient.prototype.getPhysicians = function(practiceId) {
		return this.query({
			mode: 'select',
			table: 'physician',
			fields: '*',
			where: "WHERE practice_id='" + practiceId + "'"
		});
	}
	
	// Get Physician
	patient.prototype.getPhysician = function(id, practiceId) {
		if(id == 'new')
			id = -1;
		return this.query({
			mode: 'select',
			table: 'physician',
			fields: '*',
			where: "WHERE id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	/**********************************************************************************************
	 * Save Methods
	 * 
	 * These methods add information to the database via INSERT and UPDATE queries
	 *********************************************************************************************/
	// Add Personal Information for a Single Patient
	patient.prototype.savePatient = function(id, data) {
		var self = this;
		var fields = ['practice_id', 'id', 'first_name', 'middle_name', 'last_name', 'alias', 
			'date_of_birth', 'id_number', 'id_type', 'physician_id', 'address', 'city', 'state',
			'zip', 'province', 'country', 'phone', 'phone_ext', 'mobile', 'gender', 'marital_status',
			'family_history_type','family_history_comment', 'routine_exam_comment', 'insurance_type',
			'record_status', 'contact_name', 'contact_phone', 'contact_mobile', 'contact_relationship',
			'insurance_name', 'email'];
		
		var values = $.map(data, function(k,v) {
			if(v != 'lastFirstName' && v!= 'insuredType')
				if(k() == null || k() == undefined || k() == 'null') {
					return [''];
				}
				else
					return [k()];
		});
		
		var newId = '';
		if(id == 'new') {
			self.query({
				mode: 'select',
				table: 'patient',
				fields: 'id',
				order: 'ORDER BY id DESC',
				limit: 'LIMIT 1'
			}).success(function(data) {
				$.each(data, function(key, item) {
					newId = parseInt(item.id) + 1;
				});
				
				values[1] = newId;
				
				self.query({
					mode: 'insert', 
					table: 'patient',
					fields: fields, 
					values: values
				});
			});
		}

		else {
			return self.query({
				mode: 'update', 
				table: 'patient',
				fields: fields, 
				values: values, 
				where: "WHERE id='" + id + "' AND practice_id='" + practiceId + "'"
			});
		}
	}
	
	// Add Insurance for a Single Patient
	patient.prototype.addInsurance = function(id, data) {
		var values = $.map(data, function(k,v) {
			return [k];
		});
		
		return this.query({
			mode: 'insert', 
			table: 'insurance', 
			values: values, 
			where: "WHERE patient_id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Add Guarantor for a Single Patient
	patient.prototype.addGuarantor = function(id, data) {
		var values = $.map(data, function(k,v) {
			return [k];
		});
		
		return this.query({
			mode: 'insert', 
			table: 'guarantor', 
			values: values, 
			where: "WHERE patient_id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Add Employer for a Single Patient
	patient.prototype.addEmployer = function(id, data) {
		var values = $.map(data, function(k,v) {
			return [k];
		});
		
		return this.query({
			mode: 'insert', 
			table: 'employer', 
			values: values, 
			where: "WHERE patient_id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Add Spouse for a Single Patient
	patient.prototype.addSpouse = function(id, data) {
		var values = $.map(data, function(k,v) {
			return [k];
		});
		
		return this.query({
			mode: 'insert', 
			table: 'spouse', 
			values: values, 
			where: "WHERE patient_id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Add Reference for a Single Patient
	patient.prototype.addReference = function(id, data) {
		var values = $.map(data, function(k,v) {
			return [k];
		});
		
		return this.query({
			mode: 'insert', 
			table: 'reference', 
			values: values, 
			where: "WHERE patient_id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Add Service Record for a Single Patient
	patient.prototype.addServiceRecord = function(id, data) {
		var values = $.map(data, function(k,v) {
			return [k];
		});
		
		return this.query({
			mode: 'insert', 
			table: 'service_record', 
			values: values, 
			where: "WHERE id='" + id + "'"
		});
	}
	
	/**********************************************************************************************
	 * Delete Methods
	 * 
	 * These methods remove information from the database via DELETE queries
	 *********************************************************************************************/
	// Delete Personal Information for a Single Patient
	patient.prototype.deletePatient = function(id, practiceId) {
		return this.query({
			mode: 'delete', 
			table: 'patient', 
			where: "WHERE id='" + id + "' AND practice_id='" + practiceId + "'"
		});
	}
	
	// Delete Service Record for a Single Patient
	patient.prototype.deleteServiceRecord = function(id) {
		return this.query({
			mode: 'delete', 
			table: 'service_record', 
			where: "WHERE id='" + id + "'"
		});
	}
	
	/**********************************************************************************************
	 * Query
	 * 
	 * This method is used by all other methods to execute the ajax call.
	 *********************************************************************************************/ 
	patient.prototype.query = function(data) {
		return $.getJSON('php/query.php',data);
	}
	
	/**************************************************************************************************
	 * Return class so it is usable.
	 *************************************************************************************************/
	return patient;
});