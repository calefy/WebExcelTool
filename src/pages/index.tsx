import React, { ChangeEvent, KeyboardEvent, FocusEvent } from 'react';
import { Table, Input, Button, Popconfirm, Modal } from 'antd';
import Clipboard from 'clipboard'
import styles from './index.css'
import TextArea from 'antd/lib/input/TextArea';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
interface CellData { // 真实存储的值
  rowIndex: number
  colIndex: number
  text?: string
  desc?: string
}

interface TableCellProps extends CellData {
  onChange?: (rowIndex: number, colIndex: number, text: string, desc: string) => void
}

class TableCell extends React.PureComponent<TableCellProps> {
  readonly state = {
    editing: false,
    value: '',
    desc: '',
    descShow: false,
  }
  input: React.RefObject<Input>
  textarea: React.RefObject<TextArea>
  lastDesc = ''

  constructor(props:TableCellProps) {
    super(props)

    this.state.value = props.text || ''
    this.state.desc = props.desc || ''

    this.input = React.createRef<Input>()
    this.textarea = React.createRef<TextArea>()

    this.toggleEdit = this.toggleEdit.bind(this)
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSave = this.handleSave.bind(this)

    this.toggleDescModal = this.toggleDescModal.bind(this)
    this.handleDescChange = this.handleDescChange.bind(this)
    this.handleDescCancel = this.handleDescCancel.bind(this)
    this.handleDescSave = this.handleDescSave.bind(this)
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

    const {rowIndex, colIndex} = this.props
    this.props.onChange(rowIndex, colIndex, e.target.value, this.state.desc)
  }
  handleSave(e: KeyboardEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>) {
    this.toggleEdit();
  }

  toggleDescModal() {
    if (!this.state.descShow) {
      this.lastDesc = this.state.desc
    }
    this.setState({ descShow: !this.state.descShow })
  }
  handleDescChange(e: ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ desc: e.target.value })
  }
  handleDescSave() {
    this.toggleDescModal()

    const {rowIndex, colIndex} = this.props
    const {value, desc} = this.state
    this.props.onChange(rowIndex, colIndex, value, desc)
  }
  handleDescCancel() {
    this.toggleDescModal()
    this.setState({ desc: this.lastDesc })
  }

  render() {
    const { editing, value, desc } = this.state;
    const { rowIndex, colIndex } = this.props;

    const textNode = <><div onClick={this.handleEditClick} className={styles.word}>{value}</div><i onClick={this.toggleDescModal}>i</i></>

    const inputNodeProps = {
      value,
      ref: this.input,
      onChange: this.handleChange,
      onPressEnter: this.handleSave,
      onBlur: this.handleSave,
    }
    const inputNode = <Input {...inputNodeProps}/>

    return (
      <div className={styles.cell} title={desc}>
        {colIndex === -1 ? value : editing ? inputNode : textNode}

        <Modal
          visible={this.state.descShow}
          title="输入注释"
          onCancel={this.handleDescCancel}
          onOk={this.handleDescSave}
        >
          <div><TextArea value={desc} onChange={this.handleDescChange} ref={this.textarea}/></div>
        </Modal>
      </div>
    );
  }
}


/**
 * 实际的值存储到 data中，每次渲染根据行列数，动态获取数据
 */
class EditableTable extends React.PureComponent {
  readonly state = {
    colNum: 3, // 总列数
    rowNum: 3, // 总行数
    copyModal: false,
  }
  // 存储实际的值 [rowIndex_colIndex]: CellData
  data = {}

  constructor(props) {
    super(props);

    this.handleAddColumn = this.handleAddColumn.bind(this)
    this.handleAddRow = this.handleAddRow.bind(this)
    this.handleCellChange = this.handleCellChange.bind(this)

    this.toggleCopyModal = this.toggleCopyModal.bind(this)
  }

  componentDidMount() {
    const clipboard = new Clipboard('#copyBtn')
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
      colData.width = 40
    } else {
      const prefix: string = colIndex >= 26 ? LETTERS[Math.floor(colIndex/26) - 1] : ''
      colData.title = prefix + LETTERS[colIndex % 26]
      colData.width = 100
    }
    return colData
  }
  getCellRender(colIndex: number) {
    return (text, record, rowIndex) => {
      if (colIndex === -1) {
        return text
      } else {
        const d: CellData = this.data[`${rowIndex}_${colIndex}`]
        return (
          <TableCell
            rowIndex={rowIndex}
            colIndex={colIndex}
            text={text}
            desc={d ? d.desc : null}
            onChange={this.handleCellChange}
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
    const { colNum } = this.state
    const row = { key: 'r_' + rowIndex }
    for (let i = -1; i < colNum; i++) {
      if (i === -1) {
        row[i] = rowIndex + 1
      } else {
        const d: CellData = this.data[`${rowIndex}_${i}`]
        row[i] = d ? d.text || '' : ''
      }
    }
    return row;
  }

  // 添加列
  handleAddColumn() {
    this.setState({ colNum: this.state.colNum + 1 })
  }

  // 添加行
  handleAddRow() {
    this.setState({ rowNum: this.state.rowNum + 1 })
  }

  // 单元格数据变更
  handleCellChange(rowIndex: number, colIndex: number, text: string, desc: string) {
    this.data[`${rowIndex}_${colIndex}`] = {
      rowIndex, colIndex, text, desc
    }
  }

  toggleCopyModal() {
    this.setState({ copyModal: !this.state.copyModal })
  }

  render() {
    const columns = this.getColumns();
    const dataSource = this.getRows();

    return (
      <div className={styles.page}>
        <p>
          <Button onClick={this.handleAddRow} type="primary">Add A Row</Button>
          &emsp;
          <Button onClick={this.handleAddColumn} type="primary">Add A Column</Button>
        </p>

        <Table
          columns={columns}
          dataSource={dataSource}
          bordered={true}
          pagination={false}
          scroll={{x: true}}
        />

        <hr/>

        <p>
          <Button
            type="danger"
            onClick={this.toggleCopyModal}
          >
            Copy to clipboard
          </Button>
        </p>
        <Modal
          visible={this.state.copyModal}
          title="复制确认"
          okText="复制"
          cancelText="取消"
          okButtonProps={{id: 'copyBtn', 'data-clipboard-action': 'copy', 'data-clipboard-target': '#copyCnt'}}
          onCancel={this.toggleCopyModal}
          onOk={this.toggleCopyModal}
        >
          <div id="copyCnt" className={styles.prod}>
            <table>
              <tbody>
                {dataSource.map((row, rowIndex) => {
                  return (
                    <tr key={rowIndex}>
                      {columns.map((column, index) => {
                        const colIndex = index - 1
                        if (colIndex < 0) { return null; }
                        const d = this.data[`${rowIndex}_${colIndex}`]
                        return <td key={colIndex}>
                            {row[column.dataIndex]}
                            {d && d.desc ? <p>{d.desc}</p> : null}
                          </td>
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Modal>
      </div>
    );
  }
}

export default EditableTable
