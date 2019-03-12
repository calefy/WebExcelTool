import React from 'react';
import { Table, Input, Button, Popconfirm, Form } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import Clipboard from 'clipboard'

const FormItem = Form.Item;
const EditableContext = React.createContext({});

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component<any> {
  state = {
    editing: false,
  };
  input: Input
  cell: HTMLTableDataCellElement

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = () => {
    const { record, handleSave } = this.props;
    this.toggleEdit();
    // handleSave({ ...record, ...values });
  };

  render() {
    const { editing } = this.state;
    const { editable, dataIndex, title, record, index, handleSave, ...restProps } = this.props;
    console.log(this.props)
    return (
      <td ref={node => (this.cell = node)} {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {(form: WrappedFormUtils) => {
              this.form = form;
              return editing ? (
                <FormItem style={{ margin: 0 }}>
                  {form.getFieldDecorator<string>(dataIndex, {
                    rules: [
                      {
                        required: true,
                        message: `${title} is required.`,
                      },
                    ],
                    initialValue: record[dataIndex],
                  })(
                    <Input
                      ref={node => (this.input = node)}
                      onPressEnter={this.save}
                      onBlur={this.save}
                    />
                  )}
                </FormItem>
              ) : (
                <div
                  className="editable-cell-value-wrap"
                  style={{ paddingRight: 24 }}
                  onClick={this.toggleEdit}
                >
                  {restProps.children}
                </div>
              );
            }}
          </EditableContext.Consumer>
        ) : (
          restProps.children
        )}
      </td>
    );
  }
}

class EditableTable extends React.Component {
  columns: any
  readonly state = {
    dataSource: [],
    count: 0
  }

  constructor(props) {
    super(props);
    this.columns = [
      {
        title: '1',
        dataIndex: 'name',
        width: '30%',
        editable: true,
      },
      {
        title: 'age',
        dataIndex: 'age',
      },
      {
        title: 'address',
        dataIndex: 'address',
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (text, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
              <a href="javascript:;">Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];

    this.state = {
      dataSource: [
        {
          key: '0',
          name: 'Edward King 0',
          age: '32',
          address: 'London, Park Lane no. 0',
        },
      ],
      count: 2,
    };
  }

  componentDidMount() {
    const clipboard = new Clipboard('#btn')
    clipboard.on('success', function(e) {
      console.log('suc: ', e)
      console.info('Action:', e.action);
      console.info('Text:', e.text);
      console.info('Trigger:', e.trigger);
  
      e.clearSelection();
    });
  
    clipboard.on('error', function(e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
    });
  }

  handleDelete = key => {
    const dataSource = [...this.state.dataSource];
    this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
  };

  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      name: `Edward King ${count}`,
      age: 32,
      address: `London, Park Lane no. ${count}`,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  };

  handleSave = row => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
  };

  handleCopy = ()  => {

//    console.log('clipboard content: ', clipboardy)
//    console.log('officegen: ', officegen)
//    const docx = officegen('docx')
//     const pObj = docx.createP ();
//     pObj.options.align = 'center'; // Also 'right' or 'justify'.
//     //pObj.options.indentLeft = 1440; // Indent left 1 inch
//     pObj.addText ( 'Simple' );

// pObj.addText ( ' with color', { color: '000088' } );

// pObj.addText ( ' and back color.', { color: '00ffff', back: '000088' } );

// pObj.addText ( 'Bold + underline', { bold: true, underline: true } );

// pObj.addText ( 'Fonts face only.', { font_face: 'Arial' } );
// pObj.addHorizontalLine ();

//console.log('docx: ',docx)

  }

  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div style={{padding:10}}>
        <p>
          <Button onClick={this.handleAdd} type="primary">Add a row</Button>
          &emsp;
          <Button onClick={this.handleAdd} type="primary">Add a column</Button>
          &emsp;
          <Button onClick={this.handleCopy} type="danger">Copy docx content</Button>
        </p>
        <Table
          columns={columns}
          dataSource={dataSource}
          components={components}
          bordered={true}
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
