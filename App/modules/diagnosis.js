/**************************************************************************************************
 * Module name: Diagnosis
 * Author(s): Imran Esmail 
 * Description: This module is used to query the database.
 *************************************************************************************************/
define(function(require) {
	/*********************************************************************************************** 
	 * Includes*
	 **********************************************************************************************/
	var system = require('durandal/system');			    // System logger
	var Forms = require('modules/form');					// Common form elements
	var form = new Forms(); 
	/**********************************************************************************************
	 * Constructor
	 *********************************************************************************************/
	var  diagnosis = function() {};
	/**********************************************************************************************
	 * Get Methods
	 * 
	 * These methods retrieve information from the database via SELECT queries
	 *********************************************************************************************/ 
	 // Get Review of Systems for a Single Service Record
	diagnosis.prototype.getDiagnosis = function(patientId, practiceId, date) {
		var self = this;
		var fields = ['diagnosis.id', 'diagnosis.service_record_id', 'diagnosis.diagnosis',
			'diagnosis.code'];
		
		return self.query({
			mode: 'select',
			table: 'diagnosis',
			join: "LEFT JOIN service_record ON diagnosis.service_record_id=service_record.id",
			fields: fields,
			where: "WHERE service_record.patient_id='" + patientId + "' AND service_record.practice_id='" + practiceId + "' AND service_record.date='" + date + "'"
		});
	}
	
	// Get Service Record Id
	diagnosis.prototype.getServiceRecordId = function(patientId, practiceId, date) {
		return this.query({
			mode: 'select',
			table: 'service_record',
			fields: 'id',
			where: "WHERE patient_id='" + patientId + "' AND practice_id='" + practiceId + "' AND date='" + date + "'"
		});
	}

	 /**********************************************************************************************
	 * Save Methods
	 * 
	 * These methods save information to the database via INSERT and UPDATE queries
	 *********************************************************************************************/
	 diagnosis.prototype.saveDiagnosis = function(diagnosis,patientId,practiceId,date) {
		var self = this;
		var fields = ['id', 'service_record_id', 'diagnosis', 'code'];
		var values = $.map(diagnosis, function(k,v) {
			if(k() == null || k() == undefined) {
				return [''];
			}
			else {
				return[k()];
			}
		});
		
		if (diagnosis.id() == undefined || diagnosis.id() == '') {
			self.query({
				mode: 'select',
				table: 'service_record',
				fields: 'id',
				where: "WHERE patient_id='" + patientId() + "' AND practice_id='" + practiceId() + 
				"' AND date='" + date() + "'"
			}).success(function(data) {
				diagnosis.serviceRecordId(data[0].id);
				values[1] = parseInt(data[0].id);  
			});
			return self.query({
				mode: 'select',
				table: 'diagnosis',
				fields: 'id',
				order: 'ORDER BY id DESC',
				limit: 'LIMIT 1'
			}).success(function(data) {
				var newId = 1;
				if (data.length > 0)
					newId = parseInt(data[0].id) + 1;
				
				values[0] = newId;
				diagnosis.id(newId);
				self.query({
					mode: 'insert',
					table: 'diagnosis',
					fields: fields,
					values: values
				});
			});
		}
		else {
			return self.query({
				mode: 'update',
				table: 'diagnosis',
				fields: fields,
				values: values,
				where: "WHERE id='" + diagnosis.id() + "'"
			});
		}
	}
	
	/**********************************************************************************************
	 * Delete Methods
	 * 
	 * These methods remove information from the database via DELETE queries
	 *********************************************************************************************/
	 // Delete diagnosis
	diagnosis.prototype.deleteDiagnosis = function(id) { 
		return this.query({
			mode: 'delete', 
			table: 'diagnosis', 
			where: "WHERE id='" + id + "'"
		});
	}
	 // /**********************************************************************************************
	 // * Query
	 // * 
	 // * This method is used by all other methods to execute the ajax call.
	 // *********************************************************************************************/ 
	diagnosis.prototype.query = function(data) {
		return $.getJSON('php/query.php',data);
	}
	
 return diagnosis;
});
	 
	 