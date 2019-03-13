import React, { ChangeEvent, KeyboardEvent, FocusEvent } from 'react';
import { Table, Input, Button, Popconfirm } from 'antd';
import Clipboard from 'clipboard'
import styles from './index.css'

interface CellData { // 真实存储的值
  rowIndex: number
  colIndex: number
  text?: string
  desc?: string
}

interface TableCellProps extends CellData {
  onChange?: (val: string) => void
}

class TableCell extends React.PureComponent<TableCellProps> {
  readonly state = {
    editing: false,
    value: ''
  }
  input: React.RefObject<Input>

  constructor(props:TableCellProps) {
    super(props)

    this.input = React.createRef<Input>()
    this.state.value = props.text || ''

    this.toggleEdit = this.toggleEdit.bind(this)
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleInfoClick = this.handleInfoClick.bind(this)
  }

  toggleEdit() {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.current.focus();
      }
    });
  };

  handleEditClick() {
    this.toggleEdit()
  }
  handleChange(e: ChangeEvent<HTMLInputElement>) {
    this.setState({ value: e.target.value })
  }
  handleSave(e: KeyboardEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>) {
    this.toggleEdit();
  }
  handleInfoClick() {

  }

  render() {
    console.log('cell props: ', this.props)
    const { editing, value } = this.state;
    const { rowIndex, colIndex, text, desc } = this.props;

    const textNode = <><div onClick={this.handleEditClick}>{text}</div><i onClick={this.handleInfoClick}>i</i></>

    const inputNodeProps = {
      value,
      ref: this.input,
      onChange: this.handleChange,
      onPressEnter: this.handleSave,
      onBlur: this.handleSave
    }
    const inputNode = <Input {...inputNodeProps}/>

    return (
          <div className={styles.cell} title={desc}>
            {colIndex === -1 ? text : editing ? inputNode : textNode}
          </div>
    );
  }
}


const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
/**
 * 实际的值存储到 data中，每次渲染根据行列数，动态获取数据
 */
class EditableTable extends React.PureComponent {
  readonly state = {
    colNum: 3, // 总列数
    rowNum: 3, // 总行数
    data: {} // 存储实际的值 [rowIndex_colIndex]: CellData
  }

  constructor(props) {
    super(props);

    this.handleAddColumn = this.handleAddColumn.bind(this)
    this.handleAddRow = this.handleAddRow.bind(this)
  }

  componentDidMount() {
    const clipboard = new Clipboard('#btn')
    clipboard.on('success', function(e) {
      e.clearSelection();
    });
  }

  // 列数据组装为需要格式，-1表示第一列
  getColumns() {
    const columns = []
    for (let i = -1; i < this.state.colNum; i++) {
      columns.push(this.getColumnData(i))
    }
    return columns
  }
  getColumnData(colIndex:number) {
    const colData: any = {
      key: 'c_' + colIndex,
      dataIndex: colIndex.toString(),
      render: this.getCellRender(colIndex)
    }
    if (colIndex === -1) {
      colData.title = ''
      colData.width = 30
    } else {
      const prefix: string = colIndex >= 26 ? LETTERS[Math.floor(colIndex/26) - 1] : ''
      colData.title = prefix + LETTERS[colIndex % 26]
    }
    return colData
  }
  getCellRender(colIndex: number) {
    return (text, record, rowIndex) => {
      if (colIndex === -1) {
        return text
      } else {
        const d: CellData = this.state.data[`${rowIndex}_${colIndex}`]
        return (
          <TableCell
            rowIndex={rowIndex}
            colIndex={colIndex}
            text={text}
            desc={d ? d.desc : null}
          />
        )
      }
    }
  }
  // 获取行数据记录
  getRows() {
    const rows= []
    for (let i = 0; i < this.state.rowNum; i++) {
      rows.push(this.getRowData(i))
    }
    return rows
  }
  getRowData(rowIndex: number) {
    const { colNum, data } = this.state
    const row = { key: 'r_' + rowIndex }
    for (let i = -1; i < colNum; i++) {
      if (i === -1) {
        row[i] = rowIndex + 1
      } else {
        const d: CellData = data[`${rowIndex}_${i}`]
        row[i] = d ? d.text || '' : ''
      }
    }
    return row;
  }

  handleAddColumn() {
    this.setState({ colNum: this.state.colNum + 1 })
  }
  handleAddRow() {
    this.setState({ rowNum: this.state.rowNum + 1 })
  }

  render() {
    const components = {
      body: {
        cell: TableCell
      }
    };
    const columns = this.getColumns();
    const dataSource = this.getRows();
    console.log(columns, dataSource)
    console.log('--render table--')
    return (
      <div style={{padding:10}}>
        <p>
          <Button onClick={this.handleAddRow} type="primary">Add a row</Button>
          &emsp;
          <Button onClick={this.handleAddColumn} type="primary">Add a column</Button>
          &emsp;
          <Button onClick={null} type="danger">Copy docx content</Button>
        </p>
        <Table
          columns={columns}
          dataSource={dataSource}
          bordered={true}
          pagination={false}
        />

        <p><button type="button" id="btn" data-clipboard-action="copy" data-clipboard-target="#div">click to copy</button></p>
        <div id="div">
          <p><b>Hello</b> world!</p>
          <table style={{border:'1px solid #eee'}}>
            <tbody>
              <tr>
                <td style={{color:'#f00', fontSize:40}}>1</td>
                <td>2</td>
              </tr>
              <tr>
                <td>4</td>
                <td>5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default EditableTable
