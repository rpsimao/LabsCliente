<?php
/**
 * Classe para apresentação de vários tipos de mensagem da aplicação
 * 
 * 
 * @author Ricardo Simao
 * @version 1.0
 * @copyright Fernandes & Terceiro, S.A.
 * @package Embalagem Database
 * 
 * @abstract Ultima revisao - 14/08/2009
 */

class RPS_Helpers_Messages {
	
	/**
	 * Texto da mensagem
	 * 
	 * @var string
	 */
	protected $_message;
	
	/**
	 * Tipo de mensagem
	 * 
	 * @var string
	 */
	
	protected $_type;
	
	/**
	 * Setter Method
	 *
	 * @param string $_message
	 * @return string
	 */
	public function setMessage($_message) {
		$this->_message = $_message;
	}
	
	/**
	 * Getter Method
	 *
	 * @return string
	 */
	private function getMessage() {
		return $this->_message;
	}
	
	/**
	 * Setter Method
	 * Cria o tipo de mensagem
	 *
	 * @param string $_type
	 * @return void
	 */
	public function setMessageType($_type) {
		$this->_type = $_type;
	}
	/**
	 * Getter Method
	 * Apanha o tipo de mensagem
	 * 
	 * @return string
	 */
	private function getMessageType() {
		return $this->_type;
	}
	/**
	 * Cria o código HTML para apresentação da mensagem
	 *
	 * @param string $divID
	 * @param string $imageName
	 * @return HTML code
	 */
	private function createHtmlTagsForMessageDisplay($divID, $imageName) {
		
		$msg = '<div id="' . $divID . '">';
		$msg .= '<table><tr><td><img src="http://static.fterceiro.pt/messages/' . $imageName . '" height="24" width="24"></td>';
		$msg .= '<td>';
		$msg .= $this->getMessage ();
		$msg .= '</td></tr></table>';
		$msg .= '</div>';
		return $msg;
	}
	/**
	 * Método que faz a renderização da mensagem baseado no tipo
	 *
	 * @return HTML Code
	 */
	public function displayMessage() {
		switch ($this->getMessageType ()) {
			case 'error' :
				return $this->createHtmlTagsForMessageDisplay ( 'erro', 'error.png' );
				break;
			
			case 'info' :
				return $this->createHtmlTagsForMessageDisplay ( 'info', 'info.png' );
				break;
			
			case 'success' :
				return $this->createHtmlTagsForMessageDisplay ( 'success', 'success.png' );
				break;
		}
	
	}

}

?>