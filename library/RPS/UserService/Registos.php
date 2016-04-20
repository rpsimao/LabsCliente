<?php

/**
 * Classe para efectuar pedidos á tabela Jobsdefversion da base de dados embalagem (MySQL)
 * 
 * @author Ricardo Simao
 * @version 1.0
 * @copyright Fernandes & Terceiro, S.A.
 * @package Embalagem Database
 * 
 * @abstract Ultima revisao - 20/10/2009
 */
class RPS_UserService_Registos extends RPS_Config_DB_Embalagem
{

    /**
     * Define a tabela a usar
     * @var Zend_Db_Table
     */
    protected $jobs;

    /**
     * seleciona as cartolinas
     * @var array
     */
    protected $select;

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
        $this->registos = new RegistosTable();
    }

    /**
     * Retorna todos os valores de cada laboratorio
     * @param $lab
     * @return array
     */
    public function getAll ($lab)
    {

        $sql = $this->registos->select()->where("cod_interno LIKE '$lab%'");
        $sql->order('cod_interno DESC');
        $data = $this->registos->fetchAll($sql);
        return $data;
    }

    /**
     * Retorna o ultimo numero de cada laboratorio
     * @param int $lab
     * @return int
     */
    public function getLastID ($lab)
    {

        $sql = $this->registos->select()->where("cod_interno LIKE '$lab%'");
        $sql->order('cod_interno DESC');
        $data = $this->registos->fetchRow($sql);
        $last = $data['cod_interno'];
        $last += 1;
        return $last;
    }

    /**
     * Recupera um registo baseado no código interno
     * @param int $codinterno
     * @return array
     */
    public function getOneCode ($codinterno)
    {

        $sql = $this->registos->select()->where("cod_interno = '$codinterno'");
        return $this->registos->fetchRow($sql);
    }

    /**
     * Recupera um registo baseado no número da obra
     * @param int $codinterno
     * @return array
     */
    public function getOneJob ($numObra)
    {

        $sql = $this->registos->select()->where("obra = ?", (int) $numObra);
        return $this->registos->fetchRow($sql);
    }

    /**
     * Recupera todos registos baseado no código interno
     * @param int $codinterno
     * @return array
     */
    public function getCodInterno ($codinterno)
    {

        $sql = $this->registos->select()->where("cod_interno = '$codinterno'");
        $sql->order('cod_interno DESC');
        return $this->registos->fetchAll($sql);
    }

    /**
     * Recupera todos registos baseado no ID da base de dados
     * @param int $id
     * @return array
     */
    public function getValuesByID ($id)
    {

        $sql = $this->registos->select()->where("id = '$id'");
        $data = $this->registos->fetchRow($sql);
        return $data;
    }

    /**
     * Recupera todos registos baseados no Código do cliente da base de dados
     * @param int $id
     * @return array
     */
    public function getValuesByCC ($cc)
    {

        $sql = $this->registos->select()->where("cod_cliente LIKE '%$cc%'");
        $data = $this->registos->fetchAll($sql);
        return $data;
    }

    /**
     * Recupera todos registos baseado no número da obra
     * @param int $numobra
     * @return array
     */
    public function getNumObra ($numobra)
    {

        $sql = $this->registos->select()->where("obra = '$numobra'");
        $data = $this->registos->fetchRow($sql);
        return $data;
    }

    /**
     * Insere novo registo
     * @param int $cod_interno
     * @param int $versao
     * @param int $edicao
     * @param string $cod_cliente
     * @param string $produto
     * @param string $cores
     * @param int $verniz_maquina
     * @param int $verniz_uv
     * @param int $braille
     * @param string $dimensoes
     * @param int $cortante
     * @param date $data_entrega
     * @param int $obra
     * @param int plastificacao
     * @param int estampagem
     */
    public function insert ($cod_interno, $versao, $edicao, $cod_cliente, $produto, $cores, $verniz_maquina, $verniz_uv, $braille, $dimensoes, $cortante, $data_entrega, $obra, $platificacao, $estampagem)
    {

        $params = array(
            'cod_interno' => $cod_interno , 
            'versao' => $versao , 
            'edicao' => $edicao , 
            'cod_cliente' => $cod_cliente , 
            'produto' => $produto , 
            'cores' => $cores , 
            'verniz_maquina' => $verniz_maquina , 
            'verniz_uv' => $verniz_uv , 
            'braille' => $braille , 
            'dimensoes' => $dimensoes , 
            'cortante' => $cortante , 
            'data_entrega' => $data_entrega , 
            'obra' => $obra , 
            'plastificacao' => $platificacao , 
            'estampagem' => $estampagem);
        $this->registos->insert($params);
    }

    /**
     * Actualiza registo
     * @param int $id
     * @param int $versao
     * @param int $edicao
     * @param string $cod_cliente
     * @param string $produto
     * @param string $cores
     * @param int $verniz_maquina
     * @param int $verniz_uv
     * @param int $braille
     * @param string $dimensoes
     * @param int $cortante
     * @param date $data_entrega
     * @param int $obra
     * @param int plastificacao
     * @param int estampagem
     */
    public function update ($id, $cod_interno, $versao, $edicao, $cod_cliente, $produto, $cores, $verniz_maquina, $verniz_uv, $braille, $dimensoes, $cortante, $data_entrega, $obra, $platificacao, $estampagem)
    {

        $params = array(
            'cod_interno' => $cod_interno , 
            'versao' => $versao , 
            'edicao' => $edicao , 
            'cod_cliente' => $cod_cliente , 
            'produto' => $produto , 
            'cores' => $cores , 
            'verniz_maquina' => $verniz_maquina , 
            'verniz_uv' => $verniz_uv , 
            'braille' => $braille , 
            'dimensoes' => $dimensoes , 
            'cortante' => $cortante , 
            'data_entrega' => $data_entrega , 
            'obra' => $obra , 
            'plastificacao' => $platificacao , 
            'estampagem' => $estampagem);
        $where = $this->registos->getAdapter()->quoteInto('id = ?', $id);
        $this->registos->update($params, $where);
    }

    /**
     * Apaga registo
     * @param int $id
     */
    public function delete ($id)
    {

        $where = $this->registos->getAdapter()->quoteInto('id = ?', $id);
        $this->registos->delete($where);
    }
}
?>