<?php
/**
 * TmTable
 *  
 * @author rpsimao
 * @version 
 */
require_once 'Zend/Db/Table/Abstract.php';

class TmTable extends Zend_Db_Table_Abstract
{

    /**
     * The default table name 
     */
    protected $_name = 'tm';
}

