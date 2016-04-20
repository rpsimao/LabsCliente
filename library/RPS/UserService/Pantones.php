<?php

/**
 * Classe para efectuar pedidos á tabela pantones da base de dados embalagem (MySQL)
 * 
 * @author Ricardo Simao
 * @version 1.1
 * @copyright Fernandes & Terceiro, S.A.
 * @package Embalagem Database
 * 
 * @abstract Ultima revisao - 11/03/2010
 */
class RPS_UserService_Pantones extends RPS_Config_DB_Embalagem
{

    /**
     * Define a tabela a usar
     * @var Zend_Db_Table
     */
    protected $pantones;

 
    /**
     * executa um pedido à base de dados
     * @var string
     */
    protected $sql;

    /**
     * Retorna os valores do pedido à base de dados
     * @var array
     */
    protected $row;

    /**
     * Liga à base de dados e define a tabela a usar
     * @return Zend_Db_Table
     */
    function __construct ()
    {

        parent::__construct();
        $this->pantones = new PantonesTable();
    }

    /**
     * Retorna o valor hexadecimal do pantone
     * @param string $id
     * @return array
     */
    public function getHexColor ($id)
    {

        $sql = $this->pantones->select();
        $sql->where('id =?', $id);
        $row = $this->pantones->fetchRow($sql);
        return $row;
    }
}
?>