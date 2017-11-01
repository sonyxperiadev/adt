# -*- coding: utf-8 -*-
# title          : docbuilder.py
# description    : Builds a documentation tree from document blocks.
# author         : Enys Mones
# date           : 2017.06.25
# version        : 0.1
# ==================================================================
from blockparser import BlockParser
import json
import re
import templates

# TODO make HTML export (no @ignore and @private)

class Path:
    """
    Describes a path in the documentation hierarchy.
    """
    def __init__(self, string=""):
        """
        Constructs a Path object.

        :param string: Initial string to use for the path.
        """
        self._path = string

    def __str__(self):
        """
        Casts the Path to a string.

        :return: String representation of the path.
        """
        return self._path

    def root(self):
        """
        Returns the root of the path. The root is the first node in the path.

        :return: The root of the path.
        """
        return self._path.split('.')[0]

    def append(self, node):
        """
        Appends a node to the end of this path.

        :param node: Node to append.
        """
        if self._path == "":
            self._path += node
        else:
            self._path += "." + node

    def truncate(self, path):
        """
        Removes another path from this path.

        :param path: Path to remove.
        """
        return self._path.replace(path._path, "")

    def common_parent(self, path):
        """
        Returns the lowest common parent node with another path.

        :param path: Other path to calculate lowest parent node with.
        :return: Path to the lowest parent node.
        """
        parent = Path()
        for n1, n2 in zip(self._path.split('.'), path._path.split('.')):
            if n1 == n2:
                parent.append(n1)
            else:
                return parent
        return parent

    def add_leaf(self, tree, leaf):
        """
        Adds a leaf to a tree. If intermediate nodes are missing, they are added to the tree as well with empty node
        key.

        :param tree: Tree to add leaf to.
        :param leaf: Content of the leaf to add.
        """
        node = tree
        for l, n in enumerate(self._path.split('.')):
            if n not in node['children']:
                node['children'][n] = {'node': None, 'children': {}, 'level': l}
            node = node['children'][n]
        node['node'] = leaf


class DocBuilder:
    """
    The documentation builder: parses source file and builds source tree.
    """
    def __init__(self):
        self._blocks = []

    @staticmethod
    def _path(block):
        return Path(block.path())

    def parse(self, filename):
        """
        Parses a single file, reading in all available documentation blocks.

        :param filename: Name of the file to document.
        :returns: Reference to the DocBuilder for chaining.
        """
        BlockParser.reset()
        with open(filename, 'r') as f:
            while True:
                block = BlockParser.next_block(filename, f)
                if block is None:
                    break
                else:
                    if block:
                        self._blocks.append(block)
        return self

    def _tree(self, converter=None):
        """
        Builds documentation tree and converts each block calling the specified method if given.

        :param converter: The converted to call for each block.
        :returns: The (converted) documentation tree.
        """
        tree = {'children': {}}
        for block in self._blocks:
            if converter is not None:
                Path(block.path()).add_leaf(tree, converter(block))
            else:
                Path(block.path()).add_leaf(tree, block)
        return tree['children']

    def _root(self):
        """
        Finds the path for the root node.

        :return: Path to the root of the documentation tree.
        """
        root = Path(self._blocks[0].path())
        for block in self._blocks[1:]:
            root = root.common_parent(Path(block.path()))
        return str(root)

    @staticmethod
    def _children(node):
        """
        Returns a sorted list of the children nodes.

        :param node: Node to get children for.
        :return: Children nodes sorted by their source code line.
        """
        return sorted([child for c, child in node['children'].items()],
                      key=lambda x: x['node'].line() if x['node'] is not None else 1, reverse=True)

    def json(self, filename):
        """
        Returns the JSON export of the documentation tree.

        :param filename: Name of the JSON file where the tree should be exported.
        :returns: Reference to the DocBuilder for chaining.
        """
        # Converts block to dictionary
        def to_str(b):
            return b.get()

        # Write JSON
        with open(filename, 'w') as f:
            json.dump(self._tree(to_str), f, indent=2)
        return self

    def html(self, filename, style="", main=""):
        """
        Returns the HTML export of the documentation tree using whiteprint.css.

        :param filename: Name of the HTML file where the tree should be exported.
        :param style: Additional style description appended to the head.
        :param content: Additional content appended to main.
        :returns: Reference to the DocBuilder for chaining.
        """
        def _codify(text):
            return re.sub(r'\{(.*?)\}', r'<code>\1</code>', text)

        def _tagify(text, tag, attr={}):
            ltag = "<" + tag
            for k, v in attr.items():
                ltag += " " + k + "='" + v + "'"
            ltag += ">"
            return ltag + text + "</" + tag + ">"

        def _menu(n):
            """
            Creates the menu.

            :param n: Current node in the documentation tree.
            :return: The menu HTML for the current node.
            """
            b = n['node']
            l = n['level']

            # Skip private and ignored blocks
            if b is None or b['private'] or b['ignore'] or b['deprecated']:
                return ""

            # If method or variable, just add link
            if b.type() in ['method', 'var', 'property']:
                return "<a href='#api-%s'>%s</a>" % (b.path(), b.id())

            # Create level specifier
            ls = 's%i' % l

            # If class, add third level group
            if b.type() == 'class':
                ret = _tagify('', 'input', {'id': ls + '-' + b.path(), 'type': 'checkbox'}) \
                      + _tagify(b.id(), 'label', {'for': ls + '-' + b.path()})
                sub = ''.join(_menu(c) for c in reversed(self._children(n)))
                return ret + _tagify(sub, 'div', {'class': ls})

            # If namespace, add second level group
            if b.type() == 'namespace':
                ret = _tagify('', 'input', {'id': ls + '-' + b.path(), 'type': 'checkbox'})\
                       + _tagify(b.id(), 'label', {'for': ls + '-' + b.path()})
                sub = ''.join(_menu(c) for c in reversed(self._children(n)))
                return ret + _tagify(sub, 'div', {'class': ls})

            # If module, add first level group
            if b.type() == 'module':
                ret = _tagify('', 'input', {'id': ls + '-' + b.path(), 'type': 'checkbox'}) \
                      + _tagify(b.id(), 'label', {'for': ls + '-' + b.path()})
                sub = ''.join(_menu(c) for c in reversed(self._children(n)))
                return ret + _tagify(sub, 'div', {'class': ls})

        def _property(b):
            name = "<h2 id='api-%s'>%s</h2>\n" % (b.path(), b.id())

            # Build content
            prop = b['property'][0]
            content = _tagify(prop['name'], "pre") + "<br>"
            content += _tagify(prop['type']['types'][0], "code")
            content += " " + _codify(prop['desc']) + "\n"

            return name + _tagify(content, "div", {'class': 'card'}) + "<br>"

        def _var(b):
            name = "<h2 id='api-%s'>%s</h2>\n" % (b.path(), b.id())

            # Build content
            var = b['var'][0][0]
            content = _tagify(b.path(), "pre") + "<br>"
            content += _tagify(var['type']['types'][0], "code")
            content += " " + _codify(b['desc']) + "\n"

            return name + _tagify(content, "div", {'class': 'card'}) + "<br>"

        def _method(b):
            """
            Creates the HTML content for a method block.

            :param b: Block to make content for.
            :return: HTML content for the method block.
            """
            name = "<h2 id='api-%s'>%s</h2>\n" % (b.path(), b.id())

            # Build content
            content = ""

            # Code
            code = ""
            params = b['param']
            if len(params) > 0:
                # First parameter
                if 'optional' in params[0]['type']['options']:
                    code += "["
                code += params[0]['name']

                # Remaining parameters
                for p in params[1:]:
                    if 'optional' in p['type']['options']:
                        code += "["
                    code += ", " + p['name']

                # Add closing brackets
                code += ''.join("]" for p in params if 'optional' in p['type']['options'])
            content += _tagify(b.path() + "(" + code + ")", "pre") + "\n"

            # Add description
            content += "<br>" + _codify(b['desc']) + "\n"

            # Add override
            if b['override']:
                content += "<br>" + "Overrides: " + _codify(b['override'][0][0]['name'])

            # Add parameter description
            if len(params) > 0:
                argdesc = _tagify(
                    _tagify("<th class='fifth'>arg</th><th class='fifth'>type</th><th>description</th>", "tr"),
                    "thead")
                for p in params:
                    entry = "<td><i>%s</i></td><td>%s</td>"\
                               % (p['name'], ' '.join(_tagify(pt, "code") for pt in p['type']['types']))
                    pdesc = _codify(p['desc'])
                    for opt in ['optional', 'nullable', 'non nullable']:
                        if opt in p['type']['options']:
                            pdesc += " " + _tagify(opt, "code")
                    argdesc += _tagify(entry + _tagify(pdesc, "td"), "tr")
                content += "<br>" + _tagify(argdesc, "table") + "\n"

            # Add return description
            ret = b['returns']
            if len(ret) > 0:
                retdesc = _tagify(
                    _tagify("<th class='fifth'>return</th><th>description</th>", "tr"),
                    "thead") + _tagify("<td><i>%s</i></td><td>%s</td>"
                                             % (' '.join(_tagify(rt, "code") for rt in ret[0]['type']['types']),
                                                ret[0]['desc']), "tr")
                content += _tagify(retdesc, "table")

            return name + _tagify(content, "div", {'class': 'card'}) + "<br>"

        # Build tree
        tree = self._tree()
        root = self._root()

        # Traverse tree
        menu = ""
        mainContent = ""
        stack = [tree[tree.keys()[0]]]
        while len(stack) > 0:
            # Get next node
            node = stack.pop()

            # If node is not empty, get content
            skip_children = False
            if node['node'] is not None:
                block = node['node']

                # If block is private, ignored or deprecated, skip it and all of it's children
                if block['private'] or block['ignore'] or block['deprecated']:
                    skip_children = True
                    continue

                # Build menu
                if block.type() == 'module':
                    menu += _menu(node)

                # Build main content
                t = block.type()
                if t in ['module', 'namespace']:
                    mainContent += "<h2 id='api-%s'>%s</h2>%s\n" % (block.path(), block.path(), block['desc']) + "<br>"
                    #if block['author'] is not None:
                    #    mainContent += "<br>Author: %s" % block['author']
                    if len(block['requires']) > 0:
                        mainContent += "<br>Requires: %s" % ' '.join("<code>%s</code>" % x[0]['name'] for x in block['requires'])
                    if block['copyright'] is not None:
                        mainContent += "<br><br>%s" % block['copyright']

                if t == 'method' or (t == 'class' and block['constructor']):
                    mainContent += _method(block)

                if t == 'property':
                    mainContent += _property(block)

                if t == 'var':
                    mainContent += _var(block)

                if t == 'class' and not block['constructor']:
                    mainContent += "<h2 id='api-%s'>%s</h2>%s\n" % (block.path(), block.id(), block['desc']) + "<br>"

            if not skip_children:
                stack.extend(self._children(node))

        with open(filename, 'w') as f:
            f.write(templates.html(root, menu, mainContent+main, style))

        return self
