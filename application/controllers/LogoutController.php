<?php

class LogoutController extends Zend_Controller_Action {
	
	public function init() {
		Zend_Auth::getInstance ()->clearIdentity ();
		$this->_redirect ( '/' );
	}
	
	public function indexAction() {
		// action body
	}

}

