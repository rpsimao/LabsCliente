<?php

class App_Styles_RowColor {
	
	/**
	 * Set Color Name
	 * Setter Method
	 * @param string $color1
	 * @param string $color2
	 * @return array
	 */
	public function setColors($color1, $color2) {
		
		return $this->colors = array ($color1, $color2 );
	}
	
	/**
	 * Getter Method
	 * @return array
	 */
	public function getColors() {
		
		return $this->setColors ( $this->colors [0], $this->colors [1] );
	}
	
	/**
	 * Display the Color Row
	 * @return string
	 */
	public function display($number) {
		
		if ($number & 1) {
			return $this->colors [0];
		} else {
			return $this->colors [1];
		}
	}

}

?>